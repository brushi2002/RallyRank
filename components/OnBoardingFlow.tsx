import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  ScrollView,
  StyleSheet,
  Image
} from 'react-native';

const { width } = Dimensions.get('window');

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onboardingData = [
    {
      title: "Welcome to Rally Rank",
      subtitle: "Track matches, Easily Challenge Players, Compete with your friends",
      icon: "🎾",
      image: require('../assets/images/OnBoarding1.jpg'),
      backgroundColor: "#47A86A"
    },
    {
      title: "Welcome to Rally Rank",
      subtitle: "Record match results and watch your ranking improve over time",
      image: require('../assets/images/OnBoarding2.jpg'),
      icon: "📈",
      backgroundColor: "#EFEEB4"
    },
    {
      title: "Welcome to Rally Rank",
      subtitle: "Create a Ladder on the following screen and invite your fellow players to join",
      image: require('../assets/images/OnBoarding3.jpg'),
      icon: "👥",
      backgroundColor: "#83B97B"
    }
  ];

  const nextSlide = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    }
  };

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: onboardingData[currentIndex].backgroundColor }]}>
        <View style={{ width: 60 }} />
        {currentIndex < onboardingData.length - 1 && (
          <TouchableOpacity onPress={() => setCurrentIndex(onboardingData.length - 1)}>
            <Text style={[styles.skipText, { color: 'white', fontFamily: 'Rubik' }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={{ flex: 1 }}
      >
        {onboardingData.map((item, index) => (
          
            <View key={index} style={[{ width: width, height: 874, backgroundColor: item.backgroundColor }, { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 4, overflow: 'hidden' }]}>

  <View style={{ width: 288, position: 'absolute', left: 63, top: 75, alignItems: 'center', zIndex: 10 }}>
    <Text style={{ color: 'white', fontSize: 30, textAlign: 'center', fontFamily: 'Rubik' }}>
      Welcome to{'\n'}Rally Rank
    </Text>
  </View>
  <View style={{ width: 320, position: 'absolute', left: 32, top: 520, alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
    <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', lineHeight: 24, fontFamily: 'Rubik' }}>{item.subtitle}</Text>
  </View>
  <Image style={{ width: 320, height: 320, position: 'absolute', left: 32, top: 180, borderRadius: 31 }} source={item.image} />
  <View className="w-5 h-2.5 left-[169px] top-[723px] absolute bg-green-800 rounded-[5px]" />
  <View className="w-2.5 h-2.5 left-[221px] top-[723px] absolute bg-amber-100 rounded-[5px]" />
  <View className="w-2.5 h-2.5 left-[200px] top-[723px] absolute bg-amber-100 rounded-[5px]" />
  <View className="w-14 h-14 left-[312px] top-[780px] absolute bg-green-800 rounded-[30px] shadow-[0px_15px_45px_0px_rgba(0,0,0,0.30)]" />
  <View className="w-6 h-6 left-[354px] top-[822px] absolute" />
  <View className="w-0 h-3.5 left-[349px] top-[809px] absolute origin-top-left -rotate-90 bg-white rounded-[1px]" />
  <View className="w-3 h-2 left-[349px] top-[803px] absolute origin-top-left -rotate-90 bg-white" />
  <View className="w-14 h-14 left-[92px] top-[840px] absolute bg-amber-100 rounded-[30px] shadow-[0px_6px_45px_0px_rgba(0,0,0,0.30)]" />
  <View className="w-6 h-6 left-[50px] top-[798px] absolute" />
  <View className="w-0.5 h-3.5 left-[55px] top-[811px] absolute origin-top-left -rotate-90 bg-green-800 rounded-[1px]" />
  <View className="w-3.5 h-2 left-[55px] top-[817px] absolute origin-top-left -rotate-90 bg-green-800" />
</View>
          //<View 
          //  key={index}
          //  style={[styles.slide, { backgroundColor: item.backgroundColor }]}
          //>
          //  <Text style={styles.icon}>{item.icon}</Text>
          //  <Text style={styles.title}>{item.title}</Text>
           //</ScrollView> <Text style={styles.subtitle}>{item.subtitle}</Text>
          //</View>
        ))}
      </ScrollView>

      {/* Bottom Section */}
      <View style={[styles.bottomSection, { backgroundColor: onboardingData[currentIndex].backgroundColor }]}>
        {/* Dots */}
        <View style={styles.pagination}>
          {onboardingData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={() => {
              if (currentIndex > 0) {
                const prevIndex = currentIndex - 1;
                setCurrentIndex(prevIndex);
                scrollRef.current?.scrollTo({ x: prevIndex * width, animated: true });
              }
            }}
            style={[styles.navButton, { opacity: currentIndex === 0 ? 0.3 : 1 }]}
            disabled={currentIndex === 0}
          >
            <Image source={require('../assets/images/previous.png')} style={{ width: 85, height: 85 }} resizeMode="contain" />
          </TouchableOpacity>

          {currentIndex === onboardingData.length - 1 ? (
            <TouchableOpacity onPress={onComplete} style={styles.getStartedButton}>
              <Text style={[styles.getStartedText, { color: onboardingData[currentIndex].backgroundColor }]}>
                Get Started
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <TouchableOpacity
            onPress={nextSlide}
            style={[styles.nextButton, { opacity: currentIndex === onboardingData.length - 1 ? 0.3 : 1 }]}
            disabled={currentIndex === onboardingData.length - 1}
          >
            <Image source={require('../assets/images/next.png')} style={{ width: 85, height: 85 }} resizeMode="contain" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
<style>
@import url('https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap');
</style>

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
    },
    skipText: {
      color: '#666',
      fontSize: 16,
      padding: 10,
    },
    slide: {
      width,
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    icon: {
      fontSize: 120,
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
      marginBottom: 20,
    },
    subtitle: {
      fontSize: 16,
      color: 'white',
      textAlign: 'center',
      lineHeight: 24,
      opacity: 0.9,
    },
    bottomSection: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    pagination: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 30,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.5)',
      marginHorizontal: 4,
    },
    activeDot: {
      width: 20,
      backgroundColor: 'white',
    },
    navigation: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    navButton: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navButtonText: {
      color: 'white',
      fontSize: 24,
    },
    nextButton: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonText: {
      fontSize: 24,
    },
    getStartedButton: {
      backgroundColor: 'white',
      paddingHorizontal: 40,
      paddingVertical: 15,
      borderRadius: 25,
      flex: 1,
      marginHorizontal: 20,
    },
    getStartedText: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
  
  export default OnboardingFlow;