import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';

export default function SuccessModal({ message }) {
  

    return (
        <View style={[StyleSheet.absoluteFillObject, styles.maincontainer]}>
            <View style={styles.modal}>
                <LottieView
                    style={styles.animation}
                    source={require('./Images/Animation - 1722580375836.json')}
                    autoPlay
                    loop={false} // Make sure the animation does not loop
                />
                <Text style={styles.text}>{message}</Text>
                <Text style={{ ...styles.text, fontWeight: "bold" }}>Successfully</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    maincontainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: 'white',
        width: 250, height: 250,
        padding: 10,
        borderRadius: 10,
        elevation: 5,
        flexDirection: "column",
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    text: {
        marginTop: 10,
        textAlign: 'center',
        color:"#71797E",
    },
    animation: {
        width: 150,
        height: 150,
        marginBottom: 10,
    },
});
