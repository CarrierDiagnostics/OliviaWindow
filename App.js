import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image } from 'react-native-web';

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
      const corsProxy = 'https://cors-anywhere.herokuapp.com/';
      const response = await fetch(`${corsProxy}https://carriertech.uk/public/`, {
        method: 'GET',
      });
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      const links = Array.from(doc.querySelectorAll('a[href$="/"]'));
      
      const titlesWithImages = await Promise.all(links.map(async (link) => {
        const rawTitle = link.textContent.trim();
        const dirPath = link.getAttribute('href');
        
        // Fetch the contents of each directory
        const dirResponse = await fetch(`${corsProxy}https://carriertech.uk/public/${dirPath}`, {
          method: 'GET',
        });
        const dirHtml = await dirResponse.text();
        const dirDoc = parser.parseFromString(dirHtml, 'text/html');
        
        // Log all file names in the directory
        const fileLinks = Array.from(dirDoc.querySelectorAll('a'));
        const fileNames = fileLinks.map(fileLink => fileLink.textContent.trim());
        console.log(`Files in ${rawTitle}:`, fileNames);

        // Find the first .png image in the directory
        const imageLink = dirDoc.querySelector('a[href$=".png"]');
        const imageUrl = imageLink ? `https://carriertech.uk/public/${dirPath}${imageLink.getAttribute('href')}` : null;

        // Fetch and process text.txt
        let preview = '';
        const textLink = dirDoc.querySelector('a[href="text.txt"]');
        if (textLink) {
          const textResponse = await fetch(`${corsProxy}https://carriertech.uk/public/${dirPath}text.txt`);
          const textContent = await textResponse.text();
          const sentences = textContent.match(/[^\.!\?]+[\.!\?]+/g);
          if (sentences && sentences.length >= 2) {
            preview = sentences.slice(0, 2).join(' ').trim();
          } else {
            preview = textContent.trim().substring(0, 200) + '...';
          }
        }

        return {
          title: rawTitle.replace(/_/g, ' ').replace('/', ''),
          id: rawTitle,
          imageUrl: imageUrl,
          preview: preview
        };
      }));

      const filteredTitles = titlesWithImages.filter(item => item.title !== 'Parent Directory');
      
      setBlogTitles(filteredTitles);
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
          
        </View>
        <View style={styles.mainContent}>
        <FlatList
            data={blogTitles}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => loadBlogContent(item.title)}>
                <View style={styles.blogItem}>
                  {item.imageUrl && (
                    <Image 
                      source={{ uri: item.imageUrl }} 
                      style={styles.blogImage} 
                    />
                  )}
                  <View style={styles.blogTextContainer}>
                    <Text style={styles.blogTitle}>{item.title}</Text>
                    <Text style={styles.blogPreview} numberOfLines={2}>{item.preview}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
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
    fontSize: 16,
    fontWeight: 'bold',
  },
  blogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  blogImage: {
    width: 50,
    height: 50,
    marginRight: 10,
    resizeMode: 'cover',
  },
  blogTextContainer: {
    flex: 1,
  },
  blogPreview: {
    fontSize: 14,
    color: '#666',
  },
});
