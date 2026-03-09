import { StyleSheet } from 'react-native'

export const appStyles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.42)',
    borderColor: 'rgba(255,255,255,0.62)',
    borderRadius: 10,
    borderWidth: 1,
    elevation: 0,
    opacity: 0.9,
    padding: 10,
  },
  screen: {
    flex: 1,
    gap: 16,
    paddingHorizontal: 8,
  },
  stack: {
    gap: 8,
  },
  input: {
    borderColor: 'rgba(255,255,255,0.70)',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.28)',
    marginVertical: 8,
    minHeight: 100,
    padding: 8,
    textAlignVertical: 'top',
    color: 'rgba(20,20,20,0.82)',
  },
  spacingTop: {
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(20,20,20,0.82)',
  },
  warningText: {
    color: 'rgba(150,0,20,0.82)',
    marginTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(20,20,20,0.78)',
  },
})
