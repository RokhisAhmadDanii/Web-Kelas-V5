import { Client, Databases, Storage, ID } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://sgp.cloud.appwrite.io/v1')
    .setProject('danigantengbangetsukamenabungdanjuju');

export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID };

// Constants
export const DATABASE_ID = 'danigantengbangetsukamenabungdanjuju';
export const CHATS_COLLECTION_ID = 'chats';
export const RATINGS_COLLECTION_ID = 'ratings';
export const BLACKLIST_COLLECTION_ID = 'blacklist_ips';
export const BUCKET_ID = 'danigantengbangetsukamenabungdanjuju';
