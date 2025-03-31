import Realm from 'realm';

// Model lưu thông tin bài nhạc
class Music extends Realm.Object<Music> {
  id!: number;
  name!: string;
  uri!: string;

  static schema = {
    name: 'Music',
    properties: {
      id: 'int',
      name: 'string',
      uri: 'string',
    },
    primaryKey: 'id',
  };
}

// Model mới lưu trạng thái nghe và danh sách yêu thích
class MusicStatus extends Realm.Object<MusicStatus> {
  id!: number;
  musicId!: number;
  listenedStatus!: 'Listened' | 'UnListened';
  favorite!: boolean;

  static schema = {
    name: 'MusicStatus',
    properties: {
      id: 'int',
      musicId: 'int', // Liên kết với id của Music
      listenedStatus: 'string', // "Listened" | "UnListened"
      favorite: 'bool',
    },
    primaryKey: 'id',
  };
}

const realm = new Realm({ 
  schema: [Music, MusicStatus], 
  schemaVersion: 2, 
  deleteRealmIfMigrationNeeded: true // Chỉ dùng khi phát triển
});

export { realm, Music, MusicStatus };
