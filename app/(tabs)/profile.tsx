import { View, Text } from 'react-native'
import React from 'react'
import { User, Settings, Bell } from 'lucide-react-native'

const profile = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-2xl font-bold mb-4">Profile Screen</Text>
      <View className="flex-row gap-4">
        <User size={32} color="#6366f1" />
        <Settings size={32} color="#64748b" />
        <Bell size={32} color="#f97316" />
      </View>
      <Text className="text-gray-600 mt-4">Your profile settings</Text>
    </View>
  )
}

export default profile
