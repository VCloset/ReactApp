import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleGenerateOutfit = () => {
    navigation.navigate('GenerateOutfit'); // Replace with the actual screen name
  };

  const handleViewOutfit = () => {
    navigation.navigate('Outfit'); // Replace with the actual screen name
  };

  const handleViewItems = () => {
    navigation.navigate('Item'); // Replace with the actual screen name
  };

  const handleScanItems = () => {
    navigation.navigate('ScanItem'); // Replace with the actual screen name
  };

  const handleOutfitsMatching = () => {
    navigation.navigate("Outfits Matching"); // Replace with the actual screen name
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to V-Closet!</Text>
      <TouchableOpacity style={styles.button} onPress={handleGenerateOutfit}>
        <Text style={styles.buttonText}>Generate Outfit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleViewOutfit}>
        <Text style={styles.buttonText}>View Outfit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleViewItems}>
        <Text style={styles.buttonText}>View Items</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleScanItems}>
        <Text style={styles.buttonText}>Scan Items</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleOutfitsMatching}>
        <Text style={styles.buttonText}>Outfits Matching</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000000',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ImageBackground } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import ParallaxScrollView from 'react-native-parallax-scroll-view';
// import * as Animatable from 'react-native-animatable';

// const colors = {
//   backgroundStart: '#FFF5E1',
//   backgroundEnd: '#FFDDC1',
//   primaryText: '#333333',
//   inputBackground: '#FFFFFF',
//   inputBorder: '#FFC857',
//   buttonBackgroundStart: '#FFC857',
//   buttonBackgroundEnd: '#FFA8A8',
//   buttonText: '#FFFFFF',
//   errorText: '#FF6B6B',
// };

// const HomeScreen = () => {
//   const navigation = useNavigation();

//   const handleGenerateOutfit = () => {
//     navigation.navigate('GenerateOutfit');
//   };

//   const handleViewOutfit = () => {
//     navigation.navigate('Outfit');
//   };

//   const handleViewItems = () => {
//     navigation.navigate('Item');
//   };

//   const handleScanItems = () => {
//     navigation.navigate('ScanItem');
//   };

//   const handleOutfitsMatching = () => {
//     navigation.navigate('Outfits Matching');
//   };

//   const gradientColors = {
//     backgroundStart: '#FFF5E1',
//     backgroundEnd: '#FFDDC1',
//     buttonBackgroundStart: '#FFC857',
//     buttonBackgroundEnd: '#FFA8A8',
//   };

//   return (
//     <ParallaxScrollView
//       parallaxHeaderHeight={200}
//       backgroundSpeed={10}
//       renderBackground={() => (
//         <ImageBackground
//           // source={require('./your-background-image.jpg')}
//           style={{ width: '100%', height: '100%' }}
//         />
//       )}
//     >
//       <View style={styles.container}>
//         <Animatable.Text animation="fadeInDown" style={styles.title}>
//           Welcome to V-Closet!
//         </Animatable.Text>

//         <TouchableOpacity style={styles.button} onPress={handleGenerateOutfit}>
//           <LinearGradient
//             colors={[gradientColors.buttonBackgroundStart, gradientColors.buttonBackgroundEnd]}
//             style={styles.gradient}
//           >
//             <Text style={[styles.buttonText, { color: colors.buttonText }]}>Generate Outfit</Text>
//           </LinearGradient>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.button} onPress={handleViewOutfit}>
//           <LinearGradient
//             colors={[gradientColors.buttonBackgroundStart, gradientColors.buttonBackgroundEnd]}
//             style={styles.gradient}
//           >
//             <Text style={[styles.buttonText, { color: colors.buttonText }]}>View Outfit</Text>
//           </LinearGradient>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.button} onPress={handleViewItems}>
//           <LinearGradient
//             colors={[gradientColors.buttonBackgroundStart, gradientColors.buttonBackgroundEnd]}
//             style={styles.gradient}
//           >
//             <Text style={[styles.buttonText, { color: colors.buttonText }]}>View Items</Text>
//           </LinearGradient>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.button} onPress={handleScanItems}>
//           <LinearGradient
//             colors={[gradientColors.buttonBackgroundStart, gradientColors.buttonBackgroundEnd]}
//             style={styles.gradient}
//           >
//             <Text style={[styles.buttonText, { color: colors.buttonText }]}>Scan Items</Text>
//           </LinearGradient>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.button} onPress={handleOutfitsMatching}>
//           <LinearGradient
//             colors={[gradientColors.buttonBackgroundStart, gradientColors.buttonBackgroundEnd]}
//             style={styles.gradient}
//           >
//             <Text style={[styles.buttonText, { color: colors.buttonText }]}>Outfits Matching</Text>
//           </LinearGradient>
//         </TouchableOpacity>
//       </View>
//     </ParallaxScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 20,
//   },
//   button: {
//     borderRadius: 5,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   gradient: {
//     borderRadius: 5,
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default HomeScreen;
