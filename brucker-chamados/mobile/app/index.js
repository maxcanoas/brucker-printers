import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, ScrollView, Platform, Linking
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../lib/api';
import { colors } from '../lib/theme';
import { registrarPushNotifications } from '../lib/notifications';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [perfil, setPerfil] = useState('tecnico'); // 'tecnico' ou 'admin'
  const [modoEsqueciSenha, setModoEsqueciSenha] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('token').then(async (token) => {
      if (token) {
        const tipo = await AsyncStorage.getItem('userTipo');
        await registrarPushNotifications();
        router.replace(tipo === 'admin' ? '/admin-home' : '/home');
      } else {
        setCarregando(false);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha email e senha');
      return;
    }

    setCarregando(true);
    try {
      const endpoint = perfil === 'admin' ? '/auth/admin/login' : '/auth/tecnico/login';
      const { data } = await api.post(endpoint, { email, senha });

      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('userTipo', perfil);

      if (perfil === 'admin') {
        await AsyncStorage.setItem('admin', JSON.stringify(data.admin));
      } else {
        await AsyncStorage.setItem('tecnico', JSON.stringify(data.tecnico));
      }

      await registrarPushNotifications();
      router.replace(perfil === 'admin' ? '/admin-home' : '/home');
    } catch {
      Alert.alert('Erro', 'Credenciais inválidas');
    } finally {
      setCarregando(false);
    }
  };

  const handleEsqueciSenha = async () => {
    if (!emailRecuperacao) {
      return Alert.alert('Atenção', 'Informe seu e-mail');
    }
    setEnviando(true);
    try {
      await api.post('/auth/esqueci-senha', { email: emailRecuperacao });
      Alert.alert('Sucesso', 'Se o e-mail estiver cadastrado, você receberá um link de redefinição.');
      setModoEsqueciSenha(false);
    } catch {
      Alert.alert('Erro', 'Erro ao enviar e-mail. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.loginBox}>
          <Text style={styles.title}>BRUCKER</Text>
          <Text style={styles.titleAccent}>PRINTERS</Text>
          <Text style={styles.subtitle}>Sistema de Chamados</Text>

          {/* Seletor de perfil */}
          <View style={styles.perfilSelector}>
            {['tecnico', 'admin'].map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.perfilBtn, perfil === p && styles.perfilBtnAtivo]}
                onPress={() => setPerfil(p)}
              >
                <Text style={[styles.perfilText, perfil === p && styles.perfilTextAtivo]}>
                  {p === 'tecnico' ? 'Técnico' : 'Admin'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!modoEsqueciSenha ? (
            <>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />

              <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={carregando}>
                <Text style={styles.buttonText}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModoEsqueciSenha(true)} style={styles.linkBtn}>
                <Text style={styles.linkText}>Esqueci minha senha</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.recoverDesc}>
                Informe seu e-mail para receber o link de redefinição de senha.
              </Text>

              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={emailRecuperacao}
                onChangeText={setEmailRecuperacao}
                placeholder="seu@email.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity style={styles.button} onPress={handleEsqueciSenha} disabled={enviando}>
                <Text style={styles.buttonText}>{enviando ? 'Enviando...' : 'Enviar Link'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModoEsqueciSenha(false)} style={styles.linkBtn}>
                <Text style={styles.linkText}>Voltar ao login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  loginBox: {
    backgroundColor: colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border,
    padding: 40, width: '100%', maxWidth: 400
  },
  title: {
    fontSize: 28, fontWeight: '700', color: colors.text, textAlign: 'center'
  },
  titleAccent: {
    fontSize: 28, fontWeight: '700', color: colors.accent, textAlign: 'center', marginBottom: 8
  },
  subtitle: {
    fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24
  },
  perfilSelector: {
    flexDirection: 'row', gap: 8, marginBottom: 24
  },
  perfilBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center'
  },
  perfilBtnAtivo: {
    backgroundColor: colors.accent, borderColor: colors.accent
  },
  perfilText: {
    color: colors.textSecondary, fontSize: 14, fontWeight: '500'
  },
  perfilTextAtivo: {
    color: colors.text, fontWeight: '600'
  },
  label: {
    fontSize: 13, color: colors.textSecondary, marginBottom: 6
  },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, padding: 14, color: colors.text, fontSize: 15, marginBottom: 16
  },
  button: {
    backgroundColor: colors.accent, borderRadius: 8,
    padding: 16, alignItems: 'center', marginTop: 8
  },
  buttonText: {
    color: colors.text, fontSize: 16, fontWeight: '600'
  },
  linkBtn: {
    marginTop: 16, alignItems: 'center'
  },
  linkText: {
    color: colors.textSecondary, fontSize: 13
  },
  recoverDesc: {
    color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 20
  }
});
