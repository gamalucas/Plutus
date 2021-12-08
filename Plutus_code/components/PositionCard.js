import React, {Component} from 'react';
import {StyleSheet, View, Text, FlatList} from 'react-native';

import HoldingCard from './HoldingCard';
import TickerInfo from '../utils/TickerInfo';
import formatter from '../utils/NumberFormatter';

class PositionCard extends Component {
  state = {
    position: 0,
    data: null,
    holdings: null,
  };

  constructor() {
    super();
    this.yourFunction();
  }

  // total up the current value of all positions
  // update the state so this change is reflected to the user
  updatePosition = () => {
    let sum = 0;
    for (const key in this.state.holdings) {
      if (typeof this.state.holdings[key].currPrice === 'number') {
        sum +=
          this.state.holdings[key].currPrice *
          // eslint-disable-next-line radix
          parseInt(this.state.holdings[key].numShare);
      }
    }
    this.setState({
      position: sum,
    });
  };

  // make API request for each ticker and get the latest price
  // update the price to reflect the latest in the state holding list
  updatePrices = () => {
    for (const key in this.state.holdings) {
      TickerInfo.getData(this.state.holdings[key].ticker)
        .then(res => {
          let items = [...this.state.holdings];
          let item = {...items[key]};
          item.currPrice = res.data.c;
          items[key] = item;
          this.setState({holdings: items}, () => this.updatePosition());
        })
        .catch(error => {
          console.log('price call failed with following error: ' + error);
        });
    }
  };

  // find the position where the the number of shares or avg price change
  // update the state to reflect that
  checkUpdate = newList => {
    for (const key in this.state.holdings) {
      if (
        this.state.holdings[key].numShare !== newList[key].numShare ||
        this.state.holdings[key].avgPrice !== newList[key].avgPrice
      ) {
        // update the state of the holdings so list actively updates
        let items = [...this.state.holdings];
        let updatedItem = {...this.state.holdings[key]};
        updatedItem.numShare = newList[key].numShare;
        updatedItem.avgPrice = newList[key].avgPrice;
        items[key] = updatedItem;
        this.setState(
          {
            holdings: items,
          },
          () => {
            this.updatePosition();
          },
        );
      }
    }
  };

  // listen for changes to the props
  componentDidUpdate = props => {
    if (this.state.holdings !== null) {
      if (this.state.holdings.length !== props.holdingList.length) {
        this.setState(
          {
            holdings: props.holdingList,
          },
          () => {
            this.updatePrices();
          },
        );
        // if the list size did not change but something was updated
        // a number of shares should be updated
      } else {
        this.checkUpdate(props.holdingList);
      }
    } else {
      this.setState(
        {
          holdings: props.holdingList,
        },
        () => {
          this.updatePrices();
        },
      );
    }
  };

  // function to call update prices every 15 seconds
  yourFunction = () => {
    // do whatever you like here
    this.updatePrices();
    setTimeout(this.yourFunction, 15000);
  };

  // helper function to render each HoldingCard in the list
  renderItem = ({item}) => <HoldingCard key={item.id} data={item} />;

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.position}>
          <Text style={styles.positionFont}>Hey there  </Text>
          <Text style={styles.positionFont}>
            {formatter.format(this.state.position)}
          </Text>
        </View>

        {/*Render the list of Holdings*/}
        <FlatList
          data={this.state.holdings}
          renderItem={this.renderItem}
          keyExtractor={item => item.id}
        />
      </View>
    );
  }
}

export default PositionCard;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    flexDirection: 'column',
    width: '100%',
    height: '80%',
    color: 'white',
    borderRadius: 5,
    dropShadow: 5,
  },
  position: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  positionFont: {
    fontWeight: 'bold',
    fontSize: 25,
  },
});
