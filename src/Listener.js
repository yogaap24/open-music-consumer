const fs = require("fs");

class Listener {
  constructor(playlistsService, mailSender) {
    this._playlistsService = playlistsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(
        message.content.toString(),
      );

      const playlist = await this._playlistsService.getPlaylists(
        playlistId,
      );
      const result = await this._mailSender.sendEmail(
        targetEmail,
        playlistId,
        playlist.name,
        JSON.stringify({ playlist }),
      );
      fs.appendFileSync(
        __dirname + "/../src/logs/info.log",
        `${new Date().toLocaleString()} [Listener] Success sending email to ${targetEmail} about playlist ${playlistId}\n`,
      );
    } catch (error) {
      fs.appendFileSync(
        __dirname + "/../src/logs/error.log",
        `${new Date().toLocaleString()} [Listener] Error ${error}\n`,
      );
    }
  }
}

module.exports = Listener;