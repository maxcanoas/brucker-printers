import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, ScrollView, Platform, Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import api from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { registrarPushNotifications } from '../lib/notifications';

const PERFIS = [
  { id: 'cliente', label: 'Cliente', icon: 'user' },
  { id: 'tecnico', label: 'Técnico', icon: 'tool' },
  { id: 'admin', label: 'Admin', icon: 'shield' },
];

export default function LoginScreen() {
  const { colors } = useTheme();
  const [carregando, setCarregando] = useState(true);
  const [perfil, setPerfil] = useState('cliente');
  const [codigoAcesso, setCodigoAcesso] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [modoEsqueciSenha, setModoEsqueciSenha] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    AsyncStorage.getItem('token').then(async (token) => {
      if (token) {
        const tipo = await AsyncStorage.getItem('userTipo');
        await registrarPushNotifications();
        if (tipo === 'admin') router.replace('/admin-home');
        else if (tipo === 'cliente') router.replace('/cliente-home');
        else router.replace('/home');
      } else {
        setCarregando(false);
      }
    });
  }, []);

  const handleLogin = async () => {
    if (perfil === 'cliente') {
      if (!codigoAcesso.trim()) {
        return Alert.alert('Atenção', 'Informe o código de acesso');
      }
    } else {
      if (!email || !senha) {
        return Alert.alert('Atenção', 'Preencha e-mail e senha');
      }
    }

    setCarregando(true);
    try {
      let data;

      if (perfil === 'cliente') {
        const res = await api.post('/auth/cliente/login', { codigo_acesso: codigoAcesso.trim() });
        data = res.data;
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userTipo', 'cliente');
        await AsyncStorage.setItem('cliente', JSON.stringify(data.cliente));
        router.replace('/cliente-home');
      } else if (perfil === 'admin') {
        const res = await api.post('/auth/admin/login', { email, senha });
        data = res.data;
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userTipo', 'admin');
        await AsyncStorage.setItem('admin', JSON.stringify(data.admin));
        await registrarPushNotifications();
        router.replace('/admin-home');
      } else {
        const res = await api.post('/auth/tecnico/login', { email, senha });
        data = res.data;
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userTipo', 'tecnico');
        await AsyncStorage.setItem('tecnico', JSON.stringify(data.tecnico));
        await registrarPushNotifications();
        router.replace('/home');
      }
    } catch (err) {
      const msg = perfil === 'cliente'
        ? 'Código de acesso inválido'
        : 'Credenciais inválidas';
      Alert.alert('Erro', err.response?.data?.error || msg);
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
          {/* Logo */}
          <Image
            source={require('../assets/logo-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>BRUCKER</Text>
          <Text style={styles.titleAccent}>PRINTERS</Text>
          <Text style={styles.subtitle}>Sistema de Chamados</Text>

          {/* Seletor de perfil — 3 opções */}
          <View style={styles.perfilSelector}>
            {PERFIS.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.perfilBtn, perfil === p.id && styles.perfilBtnAtivo]}
                onPress={() => { setPerfil(p.id); setModoEsqueciSenha(false); }}
              >
                <Feather
                  name={p.icon}
                  size={14}
                  color={perfil === p.id ? colors.text : colors.textSecondary}
                  style={{ marginBottom: 2 }}
                />
                <Text style={[styles.perfilText, perfil === p.id && styles.perfilTextAtivo]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {!modoEsqueciSenha ? (
            <>
              {/* Login de cliente = código de acesso */}
              {perfil === 'cliente' ? (
                <>
                  <Text style={styles.label}>Código de Acesso</Text>
                  <TextInput
                    style={styles.input}
                    value={codigoAcesso}
                    onChangeText={setCodigoAcesso}
                    placeholder="BRKXXXXXXXX"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                  />
                  <Text style={styles.hint}>
                    Informe o código fornecido pela Brucker Printers
                  </Text>
                </>
              ) : (
                <>
                  {/* Login de admin/técnico = email + senha */}
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
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={[styles.input, { paddingRight: 50 }]}
                      value={senha}
                      onChangeText={setSenha}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry={!mostrarSenha}
                    />
                    <TouchableOpacity
                      onPress={() => setMostrarSenha(!mostrarSenha)}
                      style={styles.eyeBtn}
                    >
                      <Feather
                        name={mostrarSenha ? 'eye-off' : 'eye'}
                        size={18}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={carregando}>
                <Text style={styles.buttonText}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
              </TouchableOpacity>

              {perfil !== 'cliente' && (
                <TouchableOpacity onPress={() => setModoEsqueciSenha(true)} style={styles.linkBtn}>
                  <Text style={styles.linkText}>Esqueci minha senha</Text>
                </TouchableOpacity>
              )}
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

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  loginBox: {
    backgroundColor: colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: colors.border,
    padding: 32, width: '100%', maxWidth: 400
  },
  logo: {
    width: 56, height: 56, alignSelf: 'center', marginBottom: 16
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
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', gap: 2
  },
  perfilBtnAtivo: {
    backgroundColor: colors.accent, borderColor: colors.accent
  },
  perfilText: {
    color: colors.textSecondary, fontSize: 14, fontWeight: '500'
  },
  perfilTextAtivo: {
    color: colors.text, fontWeight: '700'
  },
  label: {
    fontSize: 13, color: colors.textSecondary, marginBottom: 6
  },
  hint: {
    fontSize: 12, color: colors.textSecondary, marginTop: -8, marginBottom: 16, fontStyle: 'italic'
  },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: 8, padding: 14, color: colors.text, fontSize: 15, marginBottom: 16
  },
  eyeBtn: {
    position: 'absolute', right: 14, top: 14
  },
  button: {
    backgroundColor: colors.accent, borderRadius: 10,
    padding: 16, alignItems: 'center', marginTop: 8
  },
  buttonText: {
    color: colors.text, fontSize: 16, fontWeight: '700'
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
