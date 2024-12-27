const { PREFIX } = require("../../krampus");

module.exports = {
  name: "musica",
  description: "Buscar y descargar música desde YouTube",
  commands: ["musica"],
  usage: `${PREFIX}musica <nombre de la canción>`,
  handle: async ({
    args,
    sendReply,
    sendWaitReply,
    sendErrorReply,
    sendReact,
    searchYouTubeMusic,
    getYouTubeDownloadUrl,
    socket,
    remoteJid,
  }) => {
    if (!args.length) {
      await sendReact("❌");
      return sendErrorReply("Por favor, proporciona el nombre de la canción.");
    }

    const query = args.join(" ");
    await sendWaitReply(`Buscando "${query}" en YouTube...`);

    try {
      // Buscar la canción en YouTube
      const result = await searchYouTubeMusic(query);
      if (!result || !result.videoId) {
        await sendReact("❌");
        return sendErrorReply("No se encontraron resultados para tu búsqueda.");
      }

      const videoTitle = result.title;
      await sendWaitReply(`Procesando la descarga de "${videoTitle}"...`);

      // Obtener la URL de descarga en formato MP3
      const audioUrl = await getYouTubeDownloadUrl(`https://www.youtube.com/watch?v=${result.videoId}`);

      // Enviar el archivo de audio como mensaje
      await socket.sendMessage(remoteJid, {
        audio: {
          url: audioUrl,
        },
        mimetype: "audio/mpeg",
        fileName: `${videoTitle}.mp3`,
      });

      await sendReact("✅");
      await sendReply(`🎶 Descarga completada: "${videoTitle}"`);
    } catch (error) {
      console.error("Error al procesar el comando música:", error);
      await sendReact("❌");
      await sendErrorReply("Hubo un error al procesar tu solicitud. Inténtalo de nuevo.");
    }
  },
};