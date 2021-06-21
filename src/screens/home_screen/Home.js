import React, { Component } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';
import { Button, Icon, Text, Overlay, Rating } from 'react-native-elements';
import Header from '../../components/Header';
import { MapView, Location, Permissions } from 'expo';
import Styles from './styles';
import { saveUserCoord, setJobStatus } from '../../actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import MapViewDirections from '../../react-native-maps-directions/MapViewDirections';
import { phonecall } from 'react-native-communications';
let _timeoutVar;
let _jobInterval;
let i;

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      region: null,
      userCoord: {
        latitude: 0,
        longitude: 0
      },
      destCoord: {
        latitude: 0,
        longitude: 0
      },
      locationAddress: '',
      reviewAndRatings: false,
      drawPolyline: '',
      destinationMarker: '',
      distance: '',
      duration: '',
      fare: '',
      currentLocationButton: true,
      followsUserLocation: false,
      renderJobStatus: true,
      renderIncomingJob: false,
      jobTimer: 0,
      renderPickUp: false,
      dropOff: false
    };

    this._getLocationAsync();
  }

  static navigationOptions = {
    header: null
  };

  // get user location
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') alert('Permission to access location was denied');

    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true
    });

    let region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.922 / 40,
      longitudeDelta: 0.0421 / 40
    };

    let userCoord = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };

    this.setState({
      region,
      userCoord
    });

    this.props.saveUserCoord(
      location.coords.latitude,
      location.coords.longitude
    );

    this._reverseGeocode();
  };

  // Convert coordinates to address
  _reverseGeocode = async () => {
    const { user_coord } = this.props;
    let location = {
      latitude: user_coord.userLat,
      longitude: user_coord.userLng
    };

    let reverseGeocodeAddress = await Location.reverseGeocodeAsync(location);
    let locationAddress = `${reverseGeocodeAddress[0].street}, ${
      reverseGeocodeAddress[0].postalCode
    }, ${reverseGeocodeAddress[0].city}`;
    this.setState({ locationAddress });
  };

  //Called when user sets new current location
  _geocodeLocation = async address => {
    let geocodeAddress = await Location.geocodeAsync(address);
    let locationCoord = geocodeAddress[0];

    this.setState({
      region: {
        latitude: locationCoord.latitude,
        longitude: locationCoord.longitude,
        latitudeDelta: 0.922 / 40,
        longitudeDelta: 0.0421 / 40
      },
      userCoord: {
        latitude: locationCoord.latitude,
        longitude: locationCoord.longitude
      }
    });

    this.props.saveUserCoord(locationCoord.latitude, locationCoord.longitude);
  };

  incomingJob() {
    const { driverDetailText, blueColor, bgColor } = Styles;

    if (this.state.renderIncomingJob) {
      this.tick();

      return (
        <View
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10
          }}
        >
          <Icon name="person" size={120} />
          <Text style={driverDetailText}>Arya</Text>
          <TouchableOpacity onPress={() => phonecall('0174925821', true)}>
            <Text style={[driverDetailText, blueColor]}>017-4925821</Text>
          </TouchableOpacity>
          <View style={{ width: '60%', marginVertical: 10 }}>
            <Button
              title="Accept"
              buttonStyle={bgColor}
              onPress={() => {
                this.setState({
                  renderIncomingJob: false,
                  currentLocationButton: true,
                  renderPickUp: true
                });
              }}
            />
          </View>
        </View>
      );
    }
  }

  tick() {
    _jobInterval = setInterval(() => {
      i -= 1;
      console.log('Timer: ' + i);
      if (i === 0) {
        clearInterval(_jobInterval);
        this.setState({
          renderIncomingJob: false,
          currentLocationButton: true
        });
      }
    }, 1000);
  }

  _pickUp() {
    const { bgColor } = Styles;

    if (this.state.renderPickUp) {
      return (
        <View
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10
          }}
        >
          <Button
            title="Confirm Pick Up"
            buttonStyle={bgColor}
            onPress={() => {
              this.setState({
                dropOff: true,
                renderPickUp: false
              });
            }}
          />
        </View>
      );
    }
  }

  _dropOff() {
    const { bgColor } = Styles;

    if (this.state.dropOff) {
      return (
        <View
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            backgroundColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 10
          }}
        >
          <Button
            title="Drop Off"
            buttonStyle={{
              bgColor
            }}
            onPress={() => {
              this.setState({
                dropOff: false,
                reviewAndRatings: true
              });
            }}
          />
        </View>
      );
    }
  }

  //Called when user sets destination location
  _geocodeDestination = async address => {
    let geocodeAddress = await Location.geocodeAsync(address);
    let destinationCoord = geocodeAddress[0];

    let destCoord = {
      latitude: destinationCoord.latitude,
      longitude: destinationCoord.longitude
    };

    this.setState({
      destCoord,
      order: {
        renderSearch: false,
        renderBookNowState: true
      },
      currentLocationButton: false
    });

    this.drawPolyline();
  };

  currentLocationButton() {
    if (this.state.currentLocationButton) {
      return (
        <View
          style={{
            position: 'absolute',
            right: 20,
            bottom: 40,
            backgroundColor: 'white',
            padding: 7,
            opacity: 0.7,
            borderRadius: 3
          }}
        >
          <Icon name="gps-fixed" size={22} onPress={this._getLocationAsync} />
        </View>
      );
    }
    return <View />;
  }

  drawPolyline() {
    this.setState({
      drawPolyline: (
        <MapViewDirections
          origin={this.state.userCoord}
          destination={this.state.destCoord}
          apikey="AIzaSyB4zltzteAZKBodkd_IcKvuChbgMorfFtY"
          strokeWidth={5}
          strokeColor="#2B7EFF"
          onReady={result => {
            this.setState({
              distance: `${Math.round(result.distance)} km`,
              duration: `${Math.round(result.duration)} min`
            });

            this.calcFare(result);
          }}
        />
      ),
      destinationMarker: <MapView.Marker coordinate={this.state.destCoord} />
    });
  }

  reviewAndRatings() {
    const { bgColor, overlayContainer, driverDetailText } = Styles;

    return (
      <Overlay
        isVisible={this.state.reviewAndRatings}
        windowBackgroundColor="rgba(140, 140, 140, .5)"
        overlayBackgroundColor="#fff"
        width="80%"
        height="40%"
        overlayStyle={overlayContainer}
        onBackdropPress={() => {
          this.setState({
            renderSearch: true,
            reviewAndRatings: false,
            currentLocationButton: true
          });
        }}
      >
        <Icon name="person" size={100} />
        <Text style={driverDetailText}>Mohd. Alif</Text>
        <Rating
          type="star"
          startingValue={0}
          imageSize={25}
          onFinishRating={this.ratingCompleted}
        />
        <View style={{ width: '90%' }}>
          <TextInput
            multiline={true}
            numberOfLines={4}
            maxLength={140}
            placeholder="Tell us what you think."
            style={{ borderColor: '#4e4f51', borderWidth: 1 }}
          />
        </View>
        <View style={{ width: '60%' }}>
          <Button
            title="Submit"
            buttonStyle={bgColor}
            onPress={() =>
              this.setState({
                renderSearch: true,
                reviewAndRatings: false,
                currentLocationButton: true
              })
            }
          />
        </View>
      </Overlay>
    );
  }

  ratingCompleted(rating) {
    //console.log('Rating: ' + rating);
  }

  setJobStatus() {
    if (this.state.renderJobStatus) {
      return (
        <View
          style={{
            position: 'absolute',
            top: 0,
            backgroundColor: 'white',
            padding: 10,
            width: '100%'
          }}
        >
          <Button
            title={`Go ${this.props.job_status}`}
            buttonStyle={{
              backgroundColor: '#2B7EFF',
              width: '50%',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
            onPress={() => {
              this.props.setJobStatus(this.props.job_status);
              if (this.props.job_status === 'Online') {
                _timeoutVar = setTimeout(() => {
                  i = 30;
                  this.setState({
                    renderIncomingJob: true,
                    currentLocationButton: false
                  });
                }, 5000);
              } else {
                clearTimeout(_timeoutVar);
                i = 30;
                clearInterval(_jobInterval);
                this.setState({
                  renderIncomingJob: false,
                  currentLocationButton: true
                });
              }
            }}
          />
        </View>
      );
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Header
          navigation={this.props.navigation}
          title={`You are ${
            this.props.job_status === 'Online' ? 'Offline' : 'Online'
          }`}
        />

        <View
          style={{
            flex: 1
          }}
        >
          <MapView
            style={{ flex: 1 }}
            region={this.state.region}
            showsUserLocation={true}
            followsUserLocation={this.state.followsUserLocation}
            showsMyLocationButton={false}
            rotateEnabled={false}
            provider={MapView.PROVIDER_GOOGLE}
          >
            {this.state.drawPolyline != '' ? this.state.drawPolyline : <View />}
            {this.state.destinationMarker != '' ? (
              this.state.destinationMarker
            ) : (
              <View />
            )}
          </MapView>
          {this.setJobStatus()}
          {this.currentLocationButton()}
          {this.incomingJob()}
          {this._pickUp()}
          {this._dropOff()}
          {this.reviewAndRatings()}
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  const { paymentTypeReducer } = state;
  const { user_coord } = state.coordinateReducer;
  const { job_status } = state.jobStatusReducer;

  return { paymentTypeReducer, user_coord, job_status };
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ saveUserCoord, setJobStatus }, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);

//customMapStyle={mapStyle}
//provider={MapView.PROVIDER_GOOGLE}
//text.Object.description
