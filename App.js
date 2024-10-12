import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native-web';

export default function App() {
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogTitles, setBlogTitles] = useState([]); // Assuming you have a state for blogTitles

  const loadBlogContent = async (title) => {
    try {
      console.log("trying to get stuff");
      const blogFileUri = `https://carriertech.uk/blogs/${encodeURIComponent(title)}.txt`;
      const response = await fetch(`https://cors-anywhere.herokuapp.com/https://carriertech.uk/blogs/${encodeURIComponent(title)}`);
      console.log(`https://cors-anywhere.herokuapp.com/https://carriertech.uk/blogs/${encodeURIComponent(title)}`);
      console.log(response);
      const content = await response.text();
      setSelectedBlog({ title, content });
    } catch (error) {
      console.error('Error loading blog content:', error);
    }
  };

  const loadBlogTitles = async () => {
    try {
      const response = await fetch('https://cors-anywhere.herokuapp.com/https://carriertech.uk/blogs', {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:8081', // Your local development URL
          'X-Requested-With': 'XMLHttpRequest', // Common header for AJAX requests
        },
      });
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const links = Array.from(doc.querySelectorAll('a[href$=".txt"]'));
      const titles = links.map(link => ({
        title: link.textContent,
        id: link.textContent // Assuming title is unique for id
      }));
      setBlogTitles(titles); // Assuming you have a state for blogTitles
    } catch (error) {
      console.error('Error loading blog titles:', error);
    }
  };

  useEffect(() => {
    loadBlogTitles();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Olivia's Window</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.navbar}>
          <FlatList
            data={blogTitles}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => loadBlogContent(item.title)}>
                <Text style={styles.navItem}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <View style={styles.mainContent}>
          {selectedBlog ? (
            <>
              <Text style={styles.blogTitle}>{selectedBlog.title}</Text>
              <Text>{selectedBlog.content}</Text>
            </>
          ) : (
            <Text>Select a blog to read</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    backgroundColor: '#40E0D0', //Turquoise
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  navbar: {
    width: 200,
    backgroundColor: '#ecf0f1',
    padding: 20,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  navItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  blogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
