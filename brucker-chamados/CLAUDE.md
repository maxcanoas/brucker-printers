# Convenções do projeto Brucker Chamados

## Mobile (React Native / Expo)

### KeyboardAvoidingView

Sempre usar:

```js
behavior={Platform.OS === 'ios' ? 'padding' : undefined}
```

NUNCA usar `behavior="padding"` ou `behavior="height"` hard-coded.

**Por quê:** no Android, o sistema já reajusta a tela via `adjustResize` quando o
teclado abre. Adicionar KAV por cima causa "tremedeira" (layout oscilando).
`undefined` desliga o KAV no Android e deixa o sistema lidar. Combinação
Modal+KAV no Android é especialmente bugada — incidente confirmado com cliente
da Brucker em 2026-05-21.

iOS depende do KAV (não tem adjustResize), por isso mantém `'padding'`.
