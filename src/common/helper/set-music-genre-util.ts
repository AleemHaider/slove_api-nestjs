import { MusicGenreEntity } from '../../entity/music-genre.entity';

async function setMusicGenre(musicGenre: MusicGenreEntity[], list: []) {
  if (list && list.length > 0) {
    const musicGenreList = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < musicGenre.length; j++) {
        if (list[i] == musicGenre[j].id) {
          const obj = {
            id: musicGenre[j].id,
            type: musicGenre[j].type,
          };
          musicGenreList.push(obj);
        }
      }
    }
    return musicGenreList;
  }
}

export default setMusicGenre;
