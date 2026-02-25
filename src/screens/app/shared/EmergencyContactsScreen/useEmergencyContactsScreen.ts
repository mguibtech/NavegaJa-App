import {useState} from 'react';
import {Linking} from 'react-native';

import {useEmergencyContacts} from '@domain';

export function useEmergencyContactsScreen() {
  const {contacts, isLoading} = useEmergencyContacts();

  const [selectedContact, setSelectedContact] = useState<{name: string; number: string} | null>(null);
  const [showDialerErrorModal, setShowDialerErrorModal] = useState(false);

  const handleCallContact = async (name: string, number: string) => {
    const url = `tel:${number}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      setSelectedContact({name, number});
    } else {
      setShowDialerErrorModal(true);
    }
  };

  const handleConfirmCall = () => {
    if (selectedContact) {
      Linking.openURL(`tel:${selectedContact.number}`);
    }
    setSelectedContact(null);
  };

  const handleCancelCall = () => {
    setSelectedContact(null);
  };

  return {
    contacts,
    isLoading,
    selectedContact,
    showDialerErrorModal,
    setShowDialerErrorModal,
    handleCallContact,
    handleConfirmCall,
    handleCancelCall,
  };
}
