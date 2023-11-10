const { Pool } = require("pg");

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylists(playlistId) {
    const resultPlaylist = await this._pool.query({
      text: "SELECT id, name FROM playlists WHERE id = $1",
      values: [playlistId],
    });

    const result = await this._pool.query({
      text: `SELECT songs.id, songs.title, songs.performer
      FROM songs
      JOIN playlist_songs ON songs.id = playlist_songs.song_id
      WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    });

    return { ...resultPlaylist.rows[0], songs: result.rows };
  }
}

module.exports = PlaylistsService;
