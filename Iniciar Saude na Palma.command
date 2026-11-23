#!/bin/bash
# Abre o Saúde na Palma da Mão no Mac: API + Expo (para o Expo Go no celular).
# Dê dois cliques neste arquivo no Finder. Para parar, feche esta janela.
cd "$(dirname "$0")" || exit 1
clear
echo "== Saúde na Palma da Mão =="
echo

# Node 24 (usa o nvm se existir)
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  nvm use 24 >/dev/null 2>&1 || nvm install 24
fi
if ! command -v node >/dev/null 2>&1; then
  echo "O Node.js não está instalado. Vou abrir o site: instale a versão 24 (LTS) e abra este arquivo de novo."
  open "https://nodejs.org/pt"
  read -r -p "Aperte Enter para fechar." _
  exit 1
fi
echo "Node $(node -v)"

# Chave do Claude (fica só no .env deste computador)
if ! grep -qE '^ANTHROPIC_API_KEY=.+' .env 2>/dev/null; then
  echo
  echo "Cole a sua chave da API do Claude (começa com sk-ant-) e aperte Enter."
  echo "Ela não aparece na tela enquanto você cola. Para pular, só aperte Enter."
  read -rs CHAVE
  if [ -n "$CHAVE" ]; then
    printf '\nANTHROPIC_API_KEY=%s\n' "$CHAVE" >> .env
    echo "✔ Chave salva no .env."
  else
    echo "Sem chave: a pré-triagem usa palavras-chave."
  fi
  unset CHAVE
fi

# Dependências
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  echo
  echo "Instalando as dependências (só na primeira vez, leva alguns minutos)…"
  npm install --no-audit --no-fund || { read -r -p "Falhou. Aperte Enter para fechar." _; exit 1; }
  touch node_modules
  LIMPAR_CACHE="--clear"
fi

# Firebase: login por e-mail, índices, regras e dados de demonstração (só na primeira vez)
if [ ! -f .firebase-preparado ]; then
  echo
  echo "Preparando o Firebase…"
  node --env-file=.env scripts/preparar-firebase.mjs
  echo
  echo "Criando unidades, médicos, agendas e contas de teste…"
  if npm run seed; then touch .firebase-preparado; fi
fi

# API em segundo plano, Expo na frente
echo
echo "Ligando a API (log em api.log)…"
npm run dev:api > api.log 2>&1 &
API_PID=$!
trap 'kill $API_PID 2>/dev/null; pkill -P $API_PID 2>/dev/null' EXIT
for _ in $(seq 1 40); do
  curl -s http://localhost:3333/health >/dev/null 2>&1 && break
  sleep 1
done
if curl -s http://localhost:3333/health >/dev/null 2>&1; then
  echo "✔ API no ar."
else
  echo "✖ A API não respondeu. Últimas linhas do api.log:"
  tail -20 api.log
fi

echo
echo "Abrindo o Expo. Leia o QR code com o Expo Go (celular no mesmo Wi-Fi deste Mac)."
echo "Contas de teste: paciente@saude-palma.test, recepcao@…, medica@…, manutencao@…, admin@… (senha SaudePalma@2026)"
echo
npm run dev:mobile -- $LIMPAR_CACHE
