import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface Item {
    id: string | number;
    [key: string]: any;
}

interface ItemListProps {
    data: Item[];
    titleKey?: string;
    descriptionKey?: string;
    onItemPress?: (item: Item) => void;
}

export default function ItemList({ 
    data, 
    titleKey = 'title', 
    descriptionKey = 'description',
    onItemPress 
}: ItemListProps) {
    const renderItem = ({ item }: { item: Item }) => (
        <ThemedView 
            style={styles.itemContainer}
            onTouchEnd={() => onItemPress?.(item)}
        >
            <ThemedText style={styles.title}>
                {item[titleKey] || 'Untitled'}
            </ThemedText>
            {item[descriptionKey] && (
                <ThemedText style={styles.description}>
                    {item[descriptionKey]}
                </ThemedText>
            )}
        </ThemedView>
    );

    const ListEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
                No items found
            </ThemedText>
        </View>
    );

    return (
        <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={ListEmptyComponent}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
    },
    itemContainer: {
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        opacity: 0.8,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        opacity: 0.6,
    },
}); 