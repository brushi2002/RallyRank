import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { Client, Databases } from 'appwrite';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint('YOUR_APPWRITE_ENDPOINT') // Set your Appwrite endpoint
    .setProject('YOUR_PROJECT_ID');        // Set your project ID

const databases = new Databases(client);

interface DataGridProps {
    databaseId: string;
    collectionId: string;
    columns: string[];
    numColumns?: number;
}

interface GridItemProps {
    item: any;
    columns: string[];
}

const GridItem = ({ item, columns }: GridItemProps) => (
    <ThemedView style={styles.gridItem}>
        {columns.map((column) => (
            <ThemedText key={column} style={styles.gridItemText}>
                {item[column]?.toString() || ''}
            </ThemedText>
        ))}
    </ThemedView>
);

const GridHeader = ({ columns }: { columns: string[] }) => (
    <ThemedView style={styles.headerRow}>
        {columns.map((column) => (
            <ThemedText key={column} style={styles.headerText}>
                {column}
            </ThemedText>
        ))}
    </ThemedView>
);

export default function DataGrid({ databaseId, collectionId, columns, numColumns = 1 }: DataGridProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await databases.listDocuments(
                    databaseId,
                    collectionId
                );
                setData(response.documents);
                setLoading(false);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                setLoading(false);
            }
        };

        fetchData();
    }, [databaseId, collectionId]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <GridHeader columns={columns} />
            <FlatList
                data={data}
                renderItem={({ item }) => <GridItem item={item} columns={columns} />}
                keyExtractor={(item) => item.$id}
                numColumns={numColumns}
                style={styles.list}
            />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        flex: 1,
    },
    gridItem: {
        padding: 12,
        margin: 4,
        borderRadius: 8,
        flex: 1,
    },
    gridItemText: {
        fontSize: 14,
        marginBottom: 4,
    },
    headerRow: {
        flexDirection: 'row',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 16,
        flex: 1,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
}); 