import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import LottieView from 'lottie-react-native';


export default function LoaderModal({ message }) {
    return (
        <View style={[StyleSheet.absoluteFillObject, styles.maincontainer]}>
            <View style={styles.modal}>
                <LottieView
                    style={styles.animation}
                    source={require('./Images/car.json')}
                    autoPlay
                    loop={true}
                />
                <Text style={styles.text}>Loading ...</Text>
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
        width: 250, height: 270,
        padding: 10,
        borderRadius: 10,
        elevation: 5,
        flexDirection: "column",
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    text: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 18,
        fontFamily:"sans-serif-condensed",
    },
    animation: {
        width: 260,
        height: 200,
        marginBottom: 10,
    },
});
