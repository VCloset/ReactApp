import { Image } from 'react-native';

const ImagesLoading = () => {

    return (
        <Image source={require('../../../assets/loading/loading.gif')} style={{ width: 100, height: 100 }} />
    );
    }

export default ImagesLoading;