import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const config = {
  endpoint: process.env.EXPO_APPWRITE_ENDPOINT,
  platform: process.env.EXPO_APPWRITE_PLATFORM,
  projectId: process.env.EXPO_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_APPWRITE_DATABASE_ID,
  userCollectionId: process.env.EXPO_APPWRITE_USER_COLLECTION_ID,
  videoCollectionId: process.env.EXPO_APPWRITE_VIDEO_COLLECTION_ID,
  storageId: process.env.EXPO_APPWRITE_STORAGE_ID,
};

//provide env page data

// Init your react-native SDK
const client = new Client();

client.setEndpoint(config.endpoint).setProject(config.projectId).setPlatform(config.platform);
const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, username);
    if (!newAccount) throw Error;
    const avatarUrl = avatars.getInitials(username);

    await SignIn(email, password);
    const newUser = await databases.createDocument(config.databaseId, config.userCollectionId, ID.unique(), {
      accountId: newAccount.$id,
      email,
      username,
      avatar: avatarUrl,
    });
    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export async function signIn(email, password) {
  try {
    const session = await account.createEmailSession(email, password);
    return session;
  } catch (error) {
    throw new Error(error);
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(config.databaseId, config.userCollectionId, [
      Query.equal("accountId", currentAccount.$id),
    ]);

    if (!currentUser) throw Error;
    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};
