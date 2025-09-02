import { View, Text, Modal, ModalProps } from "react-native";

type PROPS = ModalProps & {
    isVisible: boolean;
    onClose?: boolean;
}

const PlayerCardModal = ({ isVisible, onClose, children, ...rest}: PROPS ) => {
    return(
        <Modal visible={isVisible} transparent statusBarTranslucent >
            <View className="items-center justify-center flex-1 px-3 bg-zinc-900/40">  
            <Text>Player Information</Text>
            {children}
            </View>
        </Modal>
    )
}

export default PlayerCardModal;