import { LinearGradient } from 'expo-linear-gradient';
import {
  useSQLiteContext,
  type SQLiteDatabase
} from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
interface ItemEntity {
  id: number;
  done: boolean;
  value: string;
  date: string;
}
export function Main() {
  const db = useSQLiteContext();
  const [text, setText] = useState('');
  const [todoItems, setTodoItems] = useState<ItemEntity[]>([]);
  const [doneItems, setDoneItems] = useState<ItemEntity[]>([]);
  const refetchItems = useCallback(() => {
    async function refetch() {
      await db.withExclusiveTransactionAsync(async () => {
        setTodoItems(
          await db.getAllAsync<ItemEntity>(
            'SELECT * FROM items WHERE done = ?',
            false
          )
        );
        setDoneItems(
          await db.getAllAsync<ItemEntity>(
            'SELECT * FROM items WHERE done = ?',
            true
          )
        );
      });
    }
    refetch();
  }, [db]);

  useEffect(() => {
    refetchItems();
  }, []);
  return (
    <LinearGradient
      colors={['#dccbc7', '#cbb4b0']} // Choose your favorite combo here
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
        <Text style={styles.heading}>To Do List</Text>
        <View style={styles.flexRow}>
          <TextInput
            onChangeText={(text) => setText(text)}
            onSubmitEditing={async () => {
              await addItemAsync(db, text);
              await refetchItems();
              setText('');
            }}
            placeholder="what do you need to do?"
            style={styles.input}
            value={text}
          />
        </View>

        <ScrollView style={styles.listArea}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Todo</Text>
              <View style={styles.cardGrid}>
                  {todoItems.map((item) => (
              <Item
                key={item.id}
                item={item}
                onPressItem={async (id) => {
                  await updateItemAsDoneAsync(db, id);
                  await refetchItems();
                }}
              />
            ))}
              </View>
            
          </View>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>Completed</Text>
            <View style={styles.cardGrid}>
              {doneItems.map((item) => (
              <Item
                key={item.id}
                item={item}
                onPressItem={async (id) => {
                  await deleteItemAsync(db, id);
                  await refetchItems();
                }}
              />
            ))}
            </View>
          </View>
        </ScrollView>
    </LinearGradient>
  );
}

function Item({
      item,
      onPressItem,
    }: {
      item: ItemEntity;
      onPressItem: (id) => void | Promise<void>;
    }) {
  const { id, done, value, date } = item;
  return (
    <TouchableOpacity
      onPress={() => onPressItem && onPressItem(id)}
      style={[styles.item, done && styles.itemDone]}
    >
      <Text style={[styles.itemText, done && styles.itemTextDone]}>
        {value}
      </Text>
      <Text style={[styles.itemText, done && styles.itemTextDone]}>
        {date}
      </Text>
    </TouchableOpacity>
  );
}

//#endregion

//#region Database Operations

async function addItemAsync(db: SQLiteDatabase, text: string): Promise<void> {
  if (text !== '') {
    const today = new Date();
    const formatted = today.toISOString().split('T')[0];
    console.log(formatted)
    try{
        await db.runAsync(
            'INSERT INTO items (done, value, date) VALUES (?, ?, ?);',
            false,
            text,
            formatted
            );
        console.log('Finish Adding item')
    }catch(err){
        console.log(err)
    }
  }
}

async function updateItemAsDoneAsync(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('UPDATE items SET done = ? WHERE id = ?;', true, id);
}

async function deleteItemAsync(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM items WHERE id = ?;', id);
}



const styles = StyleSheet.create({
    container: {  
    flex: 1,
    paddingTop: 64,
    },
    heading: {
        fontFamily: "Chewy",
        fontSize: 60,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    flexRow: {
    flexDirection: 'row',
    },
    input: {
      borderColor: '#766667',
      borderRadius: 4,
      borderWidth: 1,
      flex: 1,
      height: 48,
      margin: 16,
      padding: 8,
    },
    listArea: {
      flex: 1,
      paddingTop: 16,
    },
    sectionContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
    },
    sectionHeading: {
      fontFamily: 'Chewy',
      color:'#8c7d77',
      fontSize: 28,
      marginBottom: 8,
    },
    item: {
        width: '30%', // Slightly less than 33.33% to add spacing
        aspectRatio: 0.7, // Makes the height equal to the width (square)
        backgroundColor: '#f8fafc',
        borderRadius: 15,
        padding: 8,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemDone: {
      backgroundColor: '#766667',
    },
    itemText: {
        fontFamily: "Chewy",
        fontSize: 16,
        textAlign: 'center',
        color: '#955749',
        marginBottom: 4,
    },
        itemTextDone: {
        color: '#DCCBC7',
        fontSize: 14,
        textAlign: 'center',
    },

    cardGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

});

//#endregion
