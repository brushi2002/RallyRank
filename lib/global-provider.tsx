import { createContext, useContext, ReactNode, useState } from "react";
import { useAppwrite } from "./useAppwrite";
import { getCurrentUser } from "./appwrite";

interface GlobalContextType {
    isLoggedIn: boolean;
    user: User | null;
    loading: boolean;
    refetch: (newParams?: Record<string, string | number>) => Promise<void>;
}

interface User {
    $id: string;
    name: string;
    email: string;
    avatar: string;
    PhoneNumber: string;
    emailVerified: boolean;
    labels?: string[];
    leagueinfo: Record<string, any>;
    $collectionId?: string;
    $databaseId?: string;
    $createdAt?: string;
    $updatedAt?: string;
    $permissions?: string[];
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);
//const [user, setUser] = useState<User | null>(null);

export const GlobalProvider = ({children}:{children: React.ReactNode}) => {
    const
    {
        data: user,
        loading,
        refetch 
    } = useAppwrite({
        fn: getCurrentUser,
        skip: false // Allow this to run, but handle errors gracefully
    });

    console.log("User Info****", user);
    //setUser(user);
    const isLoggedIn = !!user;
    console.log('User:', user);
    return (
        <GlobalContext.Provider 
        value={{
            isLoggedIn,
            user: user as User | null,
            loading,
            refetch,
        }}
        >
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobalContext = () :  GlobalContextType => {
    const context = useContext(GlobalContext);
    if(!context) throw new Error("useGlobalContext must be used within a GlobalProvider");
    return context;
}

export default GlobalProvider;