import {
    Client,
    Account,
    ID,
    Databases,
    OAuthProvider,
    Avatars,
    Query,
   Storage
  } from "react-native-appwrite";
  import * as Linking from "expo-linking";
  import { openAuthSessionAsync } from "expo-web-browser";
import { InteractionManagerStatic, Alert } from "react-native";
  
  // Environment variables will be checked when actually used
  // This allows the app to start even if env vars are not set
  
  export const config = {
    platform: "com.ladderlink.tennisapp",
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || 'your-project-id',
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || 'your-database-id',
    playerCollectionId: process.env.EXPO_PUBLIC_APPWRITE_PLAYER_COLLECTION_ID || 'your-player-collection-id',
    memberCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MEMBER_COLLECTION_ID || 'your-member-collection-id',
    matchCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MATCH_COLLECTION_ID || 'your-match-collection-id',
    leagueCollectionId: process.env.EXPO_PUBLIC_APPWRITE_LEAGUE_COLLECTION_ID || 'your-league-collection-id',
    globalLeagueId: process.env.EXPO_PUBLIC_APPWRITE_GLOBAL_LEAGUE_ID || 'your-global-league-id',
    storageId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID || 'your-storage-id'
  };
  
  // Validation function to check if environment variables are properly set
  const validateAppwriteConfig = () => {
    if (!process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || !process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID) {
      throw new Error('Missing required Appwrite configuration. Please set up your environment variables in .env file.');
    }
  };

  export const client = new Client();
  client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform);
  
  export const avatar = new Avatars(client);
  export const account = new Account(client);
  export const databases = new Databases(client);
  export const storage = new Storage(client);

  export async function registerUser(email: string, password: string, name: string, leagueCode: string, phoneNumber: string) {
    try{
      validateAppwriteConfig();

      const lgresult = await databases.listDocuments(
        config.databaseId!,
        config.leagueCollectionId!, [Query.equal('LadderCode', leagueCode)]);

      if(lgresult.documents.length == 0){
        console.log("no league found")
        return null;
      }

      const account = new Account(client);

      console.log('verifying')
      verifyEmail(email);


      const uniqueId = ID.unique();

      console.log('creating account');
      const promise2 =  account.create(uniqueId, email, password);
      
      //const promise2 = await account.createVerification('https://example.com/verify');

      //Create the player document
      const result = await databases.createDocument(
        config.databaseId!,
        config.playerCollectionId!,
        uniqueId,
        {
          name: name,
          email: email,
          PhoneNumber: phoneNumber,
        }
      );
      const playerId = result.$id

      //Create the member document
      const result2 = await databases.createDocument(
        config.databaseId!,
        config.memberCollectionId!,
        ID.unique(),
        {
          player: uniqueId,
          league: lgresult.documents[0].$id,
          rank: 0,
          rating_value: 1400,
        }
      );
      return playerId;
    }
    catch(error){
      console.log(error);
    }
  }

  export async function verifyEmail(email: string) {

    const promise = account.createVerification('https://rallyrankemailpwverify.appwrite.network/verify');

    promise.then(function (response) {
      console.log(response); // Success
    }, function (error) {
      console.log(error); // Failure
    });
  }

  export async function markEmailVerified(userId: string, secret: string) {
    const promise = account.updateVerification(userId, secret);
  }

  export const checkActiveSession = async () => {
    try {
      const session = await account.getSession('current'); // Get the current session
      return session !== null; // Return true if there is an active session
    } catch (error: any) {
      // If there's an error (e.g., no active session), handle it appropriately
      if (error.code === 401) {
        return false; // No active session
      }
      throw error; // Re-throw other unexpected errors
    }
  };

  // Function to delete all sessions for the current user

export const deleteSessions = async () => {
  try {
    // Get the list of all sessions
    const sessions = await account.listSessions();

    // Delete each session
    await Promise.all(
      sessions.sessions.map(async (session) => {
        await account.deleteSession(session.$id);
      })
    );

    console.log('All sessions deleted successfully');
  } catch (error: any) {
    console.error('Error deleting sessions:', error.message);
    throw error; // Re-throw the error for further handling
  }
};

  export async function loginwithEmail(email: string, password: string) {
    try {
      console.log('=== Login Debug ===');
      console.log('Attempting login with email:', email);
      console.log('Password length:', password.length);
      console.log('Appwrite client config:', {
        endpoint: client.config.endpoint,
        project: client.config.project,
      });

      const session = await checkActiveSession();

      if(session){
        await deleteSessions();
      }
  
      const result = await account.createEmailPasswordSession(email, password);
      console.log('Login successful:', result);
      
      // Navigate or update state
      
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
      });
      
      // Show user-friendly error
      Alert.alert(
        'Login Error', 
        `${error.message}\n\nCode: ${error.code}`,
        [{ text: 'OK' }]
      );
    }
  }

  export async function doesLadderCodeExist(ladderCode: string) {
    const result = await databases.listDocuments(config.databaseId!, config.leagueCollectionId!, [Query.equal('LadderCode', ladderCode)]);
    return result.documents.length > 0;
  }

  export async function doesEmailExist(email: string) {
    const result = await databases.listDocuments(config.databaseId!, config.playerCollectionId!, [Query.equal('email', email)]);
    console.log(result)
    return result.documents.length > 0;
  }
  
  export async function login() {
    try {
      const redirectUri = Linking.createURL("/");
  
      const response = await account.createOAuth2Token(
        OAuthProvider.Google,
        redirectUri
      );
      if (!response) throw new Error("Create OAuth2 token failed");
  
      const browserResult = await openAuthSessionAsync(
        response.toString(),
        redirectUri
      );
      if (browserResult.type !== "success")
        throw new Error("Create OAuth2 token failed");
  
      const url = new URL(browserResult.url);
      const secret = url.searchParams.get("secret")?.toString();
      const userId = url.searchParams.get("userId")?.toString();
      if (!secret || !userId) throw new Error("Create OAuth2 token failed");
  
      const session = await account.createSession(userId, secret);
      if (!session) throw new Error("Failed to create session");
  
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  export async function logout() {
    try {
      const result = await account.deleteSession("current");
      return result;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  
  export async function getCurrentUser() {
    try {
      validateAppwriteConfig();
      const result = await account.get();
      //console.log("Appwrite response:", result);
      //console.log(result.labels)
      console.log(result.emailVerification)

      if (result.$id) {
        const userAvatar = avatar.getInitials(result.name);
        const userResult = await databases.listDocuments(config.databaseId!, config.playerCollectionId!, [Query.equal('email', result.targets[0].identifier)])
        const leagueMembership = await databases.listDocuments(config.databaseId!, config.memberCollectionId!, [Query.equal('player', userResult.documents[0].$id)])
        console.log("leagueMembership", leagueMembership)
        if(!leagueMembership.documents[0]){
          return {
            ...userResult.documents[0],
            labels: result.labels,
            emailVerified: result.emailVerification,
            leagueinfo: {
              league: {
                $id: '67f872ec002fad12bdbc',
                Name: 'Vista Tennis League'
              }
            }
          };
        }
        return {
          ...userResult.documents[0],
          labels: result.labels,
          emailVerified: result.emailVerification,
          leagueinfo: leagueMembership.documents[0]
        };
      }
  
      return null;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  export async function getLadderMembers(leagueId: string){
    try {
      console.log('Fetching Members with config:', {
        databaseId: config.databaseId,
        collectionId: config.memberCollectionId
      });
      
      const result = await databases.listDocuments(
        config.databaseId!,
        config.memberCollectionId!, 
        [Query.orderDesc('rating_value'), Query.equal('league', leagueId)]);
      
      console.log("Appwrite response get Ladder Members:", result);
      return result;
    }
    catch (error) {
      console.error('Error fetching Members:', error);
      return null;
    }
  }
  
    export async function getPlayers(leagueId: string){
    try {
      console.log('Calling Appwrite get Players: Fetching players with config:', {
        databaseId: config.databaseId,
        collectionId: config.playerCollectionId
      });
      
      const result = await databases.listDocuments(
        config.databaseId!,
        config.memberCollectionId!, 
        [Query.equal('league', leagueId), Query.orderDesc('rating_value')]
      );
      
      console.log("Appwrite response for get Players:", result);
      return result;
    }
    catch (error) {
      console.error('Error fetching players:', error);
      return null;
    }
  }

  export async function getMembership(player: string, league: string){
    try {
      const result = await databases.listDocuments(
        config.databaseId!,
        config.memberCollectionId!, [Query.equal('player', player), Query.equal('league', league)]
      );
      return result;
    }
    catch (error) {
      console.error('Error fetching membership:', error);
      return null;
    }
  }

  export async function getPlayerInfo(){
    try {
      console.log('Fetching players with config:', {
        databaseId: config.databaseId,
        collectionId: config.playerCollectionId
      });
      
      const result = await databases.listDocuments(
        config.databaseId!,
        config.playerCollectionId!
      );
      
      console.log("Appwrite response:", result);
      return result;
    }
    catch (error) {
      console.error('Error fetching players:', error);
      return null;
    }
  }


  export async function getMatchResultsForLeague(leagueID: string){
    try {
      //console.log('Fetching matches with leagueID:', leagueID);
      const result = await databases.listDocuments(
        config.databaseId!,
        config.matchCollectionId!, 
        [Query.equal('league', leagueID), Query.orderDesc('MatchDate')]
      );
      //console.log("Appwrite getMatchResultsForLeague response:", result);
      return result;  
    }
    catch (error) {
      console.error('Error fetching matches:', error);
      return null;
    }
  }
  
  export async function getAllMatchResults(){
    try {
      //console.log('Fetching matches with config:', {
      //  databaseId: config.databaseId,
      //  collectionId: config.matchCollectionId
      //});

      const result = await databases.listDocuments(
        config.databaseId!,
        config.matchCollectionId!
      )

      //console.log("Appwrite response:", result);
      return result;  
    }
    catch (error) {
      console.error('Error fetching matches:', error);
      return null;
    }
    
  }

  //export async function deleteUser(userId: string) {
  //  try {
  //    const Users
  //    const result = await (userId);
  //    return result;
   // } catch (error) {
   //   console.error('Error deleting user:', error);
   //   return null;

  export async function createLadder(ladderData: {
    Name: string,
    Description: string;
    LadderCode: string;
    CreateDate: string; 
  }) {
    //matchData.league = config.globalLeagueId || '67e6ee1c001a8cded289';
    console.log('create Ladder');
    console.log(ladderData);
    const uniqueId = ID.unique();
    try {
      const result = await databases.createDocument(
        config.databaseId!,
        config.leagueCollectionId!,
        uniqueId,
        ladderData
      );

      return result;
    } catch (error) {
      console.error('Error creating league result:', error);
      throw error;
    }
  }

  export async function createMatchResult(matchData: {
    league: string,
    player_id1: string;
    player_id2: string;
    p1set1score: number ;
    p1set2score: number;
    p1set3score: number;
    p2set1score: number;
    p2set2score: number;
    p2set3score: number;
    winner: string;
    MatchDate: string;
    s1TieBreakerPointsLost: number | null;
    s2TieBreakerPointsLost: number | null;
    s3TieBreakerPointsLost: number | null;    
  }) {
    console.log('create match result');
    console.log(matchData);
    const uniqueId = ID.unique();
    try {
      const result = await databases.createDocument(
        config.databaseId!,
        config.matchCollectionId!,
        uniqueId,
        matchData
      );
      if(matchData.winner == 'player1'){
          recalcRankings(matchData.league, matchData.player_id1, matchData.player_id2);
      }
      else{
        recalcRankings(matchData.league, matchData.player_id2, matchData.player_id1);
      }
      return result;
    } catch (error) {
      console.error('Error creating match result:', error);
      throw error;
    }
  }
  
  export async function recalcRankings(leagueId: string, winner: string, loser: string) {
    try {
      const KFactor = 32;
      // Get membership documents for both players
      const winnerMembership = await getMembership(winner, leagueId);
      const loserMembership = await getMembership(loser, leagueId);
      
      if (!winnerMembership?.documents?.[0] || !loserMembership?.documents?.[0]) {
        throw new Error("Membership not found");
      }

      const ratingW = winnerMembership.documents[0].rating_value || 0;
      const ratingL = loserMembership.documents[0].rating_value || 0;

      const expectedW = 1 / (1 + 10 ** ((ratingL - ratingW) / 400));
      const expectedL = 1 / (1 + 10 ** ((ratingW - ratingL) / 400));

      const newRankW = Math.round(Math.max(0, Math.min(10000, ratingW + KFactor * (1 - expectedW))));
      const newRankL = Math.round(Math.max(0, Math.min(10000, ratingL + KFactor * (0 - expectedL))));

      await databases.updateDocument(
        config.databaseId!, 
        config.memberCollectionId!, 
        winnerMembership.documents[0].$id, 
        { rating_value: newRankW, wins: winnerMembership.documents[0].wins + 1 }
      );
      await databases.updateDocument(
        config.databaseId!, 
        config.memberCollectionId!, 
        loserMembership.documents[0].$id, 
        { rating_value: newRankL, losses: loserMembership.documents[0].losses + 1 }
      );
    } catch(error) {
      console.error('Error recalculating rankings:', error);
      throw error;
    }
  }