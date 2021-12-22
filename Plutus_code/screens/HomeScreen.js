import React, {useContext, useEffect, useRef, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Modalize} from 'react-native-modalize';

import FormInput from '../components/FormInput';
import FormButton from '../components/FormButton';
import {AuthContext} from '../navigation/AuthProvider';

import PositionCard from '../components/PositionCard';
import Firebase from '../utils/Firebase';

const HomeScreen = ({route}) => {
  const {user, logout} = useContext(AuthContext); //get user info and data - to get user ID for example {user.uid}
  const modalizeState = useRef(null);

  const [tickerToDelete, setTickerToDelete] = useState(null);
  const [newHolding, setNewHolding] = useState({
    ticker: null,
    numShares: null,
    avgPrice: null,
    tag: null,
    submit: false,
  });

  const addPosition = () => {
    if (newHolding.ticker && newHolding.numShares) {
      const newState = Object.assign({}, newHolding, {
        ['submit']: true,
        ['id']: Math.round(Math.random() * 100000000000),
      });
      setNewHolding(newState);
      modalizeState.current?.close();
    } else {
      alert('Please provide a Ticker and the Number of Shares');
    }
  };

  const resetDelete = () => {
    setTickerToDelete(null);
  };

  useEffect(() => {
    if (typeof route.params !== 'undefined') {
      // the variable is defined, check if it has ticker
      if (route.params.hasOwnProperty('ticker')) {
        Firebase.deleteAsset(route.params.ticker, user.uid);

        // set ticker delete for position card so its removed from list
        setTickerToDelete(route.params.ticker);
      }
    }
  }, [route]);

  const onFieldChange = e => {
    const {name, value} = e;
    const newState = Object.assign({}, newHolding, {
      [name]: value.toUpperCase(),
    });
    setNewHolding(newState);
  };

  const resetFields = () => {
    setNewHolding({
      ticker: null,
      numShares: null,
      avgPrice: null,
      tag: null,
      submit: false,
    });
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <PositionCard
          user={user}
          deletion={{
            resetDelete: resetDelete,
            tickerToDelete: tickerToDelete,
          }}
          newHolding={newHolding}
          resetFields={resetFields}
        />

        <FormButton
          buttonTitle="Add Position"
          onPress={() => modalizeState.current?.open()}
        />

        <Modalize ref={modalizeState} snapPoint={500}>
          <View style={styles.container}>
            <Text style={styles.titleText}> Add a new position </Text>
            <FormInput
              value={newHolding.ticker}
              onChangeText={value => onFieldChange({name: 'ticker', value})}
              placeholder="Ticker"
              autoCorrect={false}
            />
            <FormInput
              value={newHolding.numShares}
              onChangeText={value => onFieldChange({name: 'numShares', value})}
              placeholder="Number of Shares"
              autoCorrect={false}
              keyBoardType="numeric"
            />
            <FormInput
              value={newHolding.avgPrice}
              onChangeText={value => onFieldChange({name: 'avgPrice', value})}
              placeholder="Average Price"
              autoCorrect={false}
              keyBoardType="numeric"
            />
            <FormInput
              value={newHolding.tag}
              onChangeText={value => onFieldChange({name: 'tag', value})}
              placeholder="Tag"
              autoCorrect={false}
            />
            <FormButton buttonTitle="Save" onPress={addPosition} />
          </View>
        </Modalize>
        <FormButton buttonTitle="Logout" onPress={() => logout()} />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  titleText: {
    paddingBottom: 20,
    fontSize: 25,
  },
  // boxWithShadow: {
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.8,
  //   shadowRadius: 2,
  //   elevation: 5,
  // },
});
