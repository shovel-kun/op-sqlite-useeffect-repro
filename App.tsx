import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, Text, View } from "react-native";
import { open, QueryResult } from "@op-engineering/op-sqlite";
import { useEffect, useState } from "react";

const db = open({ name: "test.db" });

db.execute(
  "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY, name TEXT)",
);

function DatabaseComponent() {
  const [result, setResult] = useState<any[] | null>(null);

  useEffect(() => {
    console.log("Effect mounted");

    const unsubscribe = db.reactiveExecute({
      query: "SELECT * FROM test",
      arguments: [],
      fireOn: [
        {
          table: "test",
        },
      ],
      callback: (result: QueryResult) => {
        console.log("Callback ran!");
        setResult(result.rows._array);
      },
    });

    // NOTE: unsubscribe() works when called here, but not when unmounting.
    // unsubscribe();

    return () => {
      console.log("Effect unmounting");
      // NOTE: "Callback ran!" still prints even though we've unsubscribed.
      unsubscribe();
    };
  }, []);

  return (
    <View>
      <Text>Database component</Text>
      <Text>{result?.length}</Text>
    </View>
  );
}

export default function App() {
  const [showDatabase, setShowDatabase] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Button
        title={showDatabase ? "Unmount Database" : "Mount Database"}
        onPress={() => setShowDatabase(!showDatabase)}
      />
      {showDatabase && <DatabaseComponent />}
      <Button
        title="Execute query"
        onPress={async () => {
          console.log("Pressed!");
          await db.transaction(async (tx) => {
            tx.execute("INSERT INTO test (name) VALUES (?)", ["test"]);
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
