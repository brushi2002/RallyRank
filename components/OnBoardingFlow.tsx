import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  ScrollView,
  StyleSheet 
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
      subtitle: "Track matches, Easily Challenge Players, Join and Climb Ladders",
      icon: "🎾",
      backgroundColor: "#306e43"
    },
    {
      title: "Track Your Progress",
      subtitle: "Record match results and watch your ranking improve over time",
      icon: "📈",
      backgroundColor: "#306e43"
    },
    {
      title: "Challenge Opponents",
      subtitle: "Easily Challenge Players via Text Message, View Opponent Results",
      icon: "👥",
      backgroundColor: "#306e43"
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
      <View style={styles.header}>
        <View style={{ width: 60 }} />
        {currentIndex < onboardingData.length - 1 && (
          <TouchableOpacity onPress={() => setCurrentIndex(onboardingData.length - 1)}>
            <Text style={styles.skipText}>Skip</Text>
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
          <View 
            key={index}
            style={[styles.slide, { backgroundColor: item.backgroundColor }]}
          >
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
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
            <Text style={styles.navButtonText}>‹</Text>
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
            <Text style={[styles.nextButtonText, { color: onboardingData[currentIndex].backgroundColor }]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

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
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255,255,255,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    navButtonText: {
      color: 'white',
      fontSize: 24,
    },
    nextButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'white',
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