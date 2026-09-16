/**
 * Cloudflare Worker Script for KitsLight Cloud Temp (R2 Integration)
 * 
 * PANDUAN UPDATE CODE:
 * 1. Buka Cloudflare Dashboard -> "Workers & Pages" -> Pilih Worker Anda (misal: "kitslight-r2-api").
 * 2. Klik "Edit Code" -> Timpa semua kode dengan kode baru ini -> Klik "Deploy".
 * 
 * KEUNGGULAN VERSI INI:
 * - File di R2 tersimpan dengan NAMA ASLI dan EKSTENSI ASLI (contoh: "ab12cd_foto.png" / "ab12cd_dokumen.pdf").
 * - File .json berisi metadata masa aktif (otomatis dihapus jika sudah kadaluarsa).
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Handle CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "*",
        },
      });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    };

    // 2. Global Live Cloud Configuration (Syncs Author settings to all visitors globally via R2)
    if (request.method === "GET" && url.pathname === "/config") {
      try {
        const configObj = await env.R2_BUCKET.get("global_author_config.json");
        if (configObj) {
          const configData = await configObj.text();
          return new Response(configData, {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
          });
        }
        return new Response(JSON.stringify({}), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (request.method === "POST" && url.pathname === "/config") {
      try {
        const body = await request.json();
        await env.R2_BUCKET.put("global_author_config.json", JSON.stringify(body), {
          httpMetadata: { contentType: "application/json" },
        });
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 3. Upload Endpoint: POST /upload
    if (request.method === "POST" && url.pathname === "/upload") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");
        const shortId = formData.get("shortId");
        const fileName = formData.get("fileName") || file.name || "file";
        const expiresAt = Number(formData.get("expiresAt")) || (Date.now() + 24 * 3600 * 1000);

        if (!file || !shortId) {
          return new Response(JSON.stringify({ error: "File and shortId required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const safeFileName = fileName.replace(/[^\w\.\-]/g, "_");
        const fileKey = `${shortId}_${safeFileName}`; // Contoh: ab12cd_laporan.pdf (Lengkap dengan ekstensi asli!)
        const metaKey = `meta_${shortId}.json`;
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

        const metadata = {
          shortId,
          fileName,
          safeFileName,
          fileKey,
          sizeMB,
          sizeBytes: file.size,
          expiresAtTimestamp: expiresAt,
          expiresAtFormatted: new Date(expiresAt).toLocaleString("id-ID"),
          storageType: "r2_worker",
        };

        // 2a. Simpan File Asli ke R2 dengan Nama & Ekstensi Asli
        await env.R2_BUCKET.put(fileKey, file.stream(), {
          httpMetadata: {
            contentType: file.type || "application/octet-stream",
            contentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
          },
        });

        // 2b. Simpan File Metadata JSON ke R2 (Catatan masa kadaluarsa file)
        await env.R2_BUCKET.put(metaKey, JSON.stringify(metadata), {
          httpMetadata: { contentType: "application/json" },
        });

        return new Response(
          JSON.stringify({
            ok: true,
            metadata,
            url: `${url.origin}/file/${shortId}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 3. Metadata Endpoint: GET /meta/:id
    if (request.method === "GET" && url.pathname.startsWith("/meta/")) {
      const shortId = url.pathname.replace("/meta/", "").trim();
      const metaKey = `meta_${shortId}.json`;
      const metaObj = await env.R2_BUCKET.get(metaKey);

      if (!metaObj) {
        return new Response(JSON.stringify({ error: "File tidak ditemukan atau telah kadaluarsa" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const metaText = await metaObj.text();
      const meta = JSON.parse(metaText);

      // Otomatis hapus jika masa aktif sudah kadaluarsa
      if (Date.now() > meta.expiresAtTimestamp) {
        if (meta.fileKey) {
          await env.R2_BUCKET.delete(meta.fileKey);
        }
        await env.R2_BUCKET.delete(`file_${shortId}`);
        await env.R2_BUCKET.delete(metaKey);

        return new Response(JSON.stringify({ error: "File telah kadaluarsa dan otomatis terhapus" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(metaText, {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. File Download Endpoint: GET /file/:id
    if (request.method === "GET" && url.pathname.startsWith("/file/")) {
      const shortId = url.pathname.replace("/file/", "").trim();
      const metaKey = `meta_${shortId}.json`;
      const metaObj = await env.R2_BUCKET.get(metaKey);

      let fileObj = null;
      let originalFileName = "file";

      if (metaObj) {
        const meta = JSON.parse(await metaObj.text());
        originalFileName = meta.fileName || "file";
        if (meta.fileKey) {
          fileObj = await env.R2_BUCKET.get(meta.fileKey);
        }
      }

      // Fallback format nama file lama
      if (!fileObj) {
        fileObj = await env.R2_BUCKET.get(`file_${shortId}`);
      }

      if (!fileObj) {
        return new Response("File tidak ditemukan", {
          status: 404,
          headers: corsHeaders,
        });
      }

      const headers = new Headers();
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(originalFileName)}"`);
      fileObj.writeHttpMetadata(headers);
      headers.set("etag", fileObj.httpEtag);

      return new Response(fileObj.body, { headers });
    }

    return new Response("KitsLight Cloud Temp R2 API is Online.", {
      headers: corsHeaders,
    });
  },
};
