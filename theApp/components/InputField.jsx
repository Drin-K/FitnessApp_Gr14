import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet,
  TouchableOpacity 
} from 'react-native';

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete = 'off',
  icon,
  onIconPress,
  error,
  ...props
}) => {
  // Helper function to validate and render icon
  const renderIcon = () => {
    if (!icon) return null;
    
    // Check if icon is a valid React element
    if (React.isValidElement(icon)) {
      return (
        <TouchableOpacity onPress={onIconPress} style={styles.iconContainer}>
          {icon}
        </TouchableOpacity>
      );
    }
    
    // If icon is a string, wrap it in Text component
    if (typeof icon === 'string') {
      return (
        <TouchableOpacity onPress={onIconPress} style={styles.iconContainer}>
          <Text style={styles.iconText}>{icon}</Text>
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.inputGroup}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error && styles.inputContainerError
      ]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#666"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          selectionColor="#00ff88"
          {...props}
        />
        
        {renderIcon()}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#bfffd6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputContainerError: {
    borderColor: '#ff4444',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  iconContainer: {
    padding: 4,
  },
  iconText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});

export default InputField;