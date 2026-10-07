-- CreateEnum
CREATE TYPE "perfil" AS ENUM ('paciente', 'recepcionista', 'medico', 'manutencao', 'administrativo');

-- CreateEnum
CREATE TYPE "status_usuario" AS ENUM ('ativo', 'pre_cadastro', 'inativo');

-- CreateEnum
CREATE TYPE "sexo" AS ENUM ('feminino', 'masculino', 'outro', 'prefiro_nao_informar');

-- CreateEnum
CREATE TYPE "canal_consentimento" AS ENUM ('app', 'pwa', 'recepcao', 'seed');

-- CreateEnum
CREATE TYPE "tipo_unidade" AS ENUM ('hospital', 'clinica');

-- CreateEnum
CREATE TYPE "tipo_conselho" AS ENUM ('CRM');

-- CreateEnum
CREATE TYPE "tipo_chamado" AS ENUM ('agendado', 'espontaneo');

-- CreateEnum
CREATE TYPE "status_chamado" AS ENUM ('agendado', 'aguardando_recepcao', 'aguardando_medico', 'chamando', 'em_atendimento', 'concluido', 'cancelado', 'nao_compareceu', 'encaminhado_emergencia');

-- CreateEnum
CREATE TYPE "urgencia" AS ENUM ('rotina', 'prioritario', 'emergencia');

-- CreateEnum
CREATE TYPE "origem_chamado" AS ENUM ('app', 'pwa', 'whatsapp', 'recepcao');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "cpf" CHAR(11) NOT NULL,
    "senha_hash" VARCHAR(72),
    "telefone" VARCHAR(13),
    "data_nascimento" DATE,
    "sexo" "sexo",
    "perfil" "perfil" NOT NULL,
    "unidade_id" UUID,
    "status" "status_usuario" NOT NULL,
    "preferencia_letra_grande" BOOLEAN NOT NULL DEFAULT false,
    "preferencia_alto_contraste" BOOLEAN NOT NULL DEFAULT false,
    "preferencia_lembrete_whatsapp" BOOLEAN NOT NULL DEFAULT false,
    "consentimento_versao_termo" VARCHAR(20) NOT NULL,
    "consentimento_aceito_em" TIMESTAMPTZ(3) NOT NULL,
    "consentimento_canal" "canal_consentimento" NOT NULL,
    "consentimento_exibicao_painel" BOOLEAN NOT NULL,
    "expo_push_tokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "criado_por_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "familia_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_em" TIMESTAMPTZ(3) NOT NULL,
    "revogada_em" TIMESTAMPTZ(3),
    "substituida_por_id" UUID,
    "ip" INET,
    "user_agent" VARCHAR(300),

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redefinicoes_senha" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID NOT NULL,
    "token_hash" CHAR(64) NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_em" TIMESTAMPTZ(3) NOT NULL,
    "usado_em" TIMESTAMPTZ(3),
    "invalidado_em" TIMESTAMPTZ(3),
    "ip" INET,

    CONSTRAINT "redefinicoes_senha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ator_id" UUID,
    "ator_perfil" "perfil",
    "unidade_id" UUID,
    "acao" VARCHAR(40) NOT NULL,
    "recurso" VARCHAR(40) NOT NULL,
    "recurso_id" VARCHAR(64) NOT NULL,
    "em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" INET,
    "detalhes" JSONB,

    CONSTRAINT "auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "especialidades" (
    "id" VARCHAR(64) NOT NULL,
    "nome" VARCHAR(60) NOT NULL,
    "descricao" VARCHAR(300) NOT NULL,
    "palavras_chave" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nome" VARCHAR(120) NOT NULL,
    "tipo" "tipo_unidade" NOT NULL,
    "cnpj" CHAR(14) NOT NULL,
    "endereco_logradouro" VARCHAR(120) NOT NULL,
    "endereco_numero" VARCHAR(10) NOT NULL,
    "endereco_bairro" VARCHAR(60) NOT NULL,
    "endereco_cidade" VARCHAR(60) NOT NULL,
    "endereco_uf" CHAR(2) NOT NULL,
    "endereco_cep" CHAR(8) NOT NULL,
    "bairro_busca" VARCHAR(60) NOT NULL,
    "telefone" VARCHAR(13) NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades_especialidades" (
    "unidade_id" UUID NOT NULL,
    "especialidade_id" VARCHAR(64) NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unidades_especialidades_pkey" PRIMARY KEY ("unidade_id","especialidade_id")
);

-- CreateTable
CREATE TABLE "medicos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "usuario_id" UUID,
    "nome" VARCHAR(120) NOT NULL,
    "conselho_tipo" "tipo_conselho" NOT NULL DEFAULT 'CRM',
    "conselho_numero" VARCHAR(7) NOT NULL,
    "conselho_uf" CHAR(2) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_por_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicos_unidades" (
    "medico_id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicos_unidades_pkey" PRIMARY KEY ("medico_id","unidade_id")
);

-- CreateTable
CREATE TABLE "medicos_especialidades" (
    "medico_id" UUID NOT NULL,
    "especialidade_id" VARCHAR(64) NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medicos_especialidades_pkey" PRIMARY KEY ("medico_id","especialidade_id")
);

-- CreateTable
CREATE TABLE "consultorios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unidade_id" UUID NOT NULL,
    "identificacao" VARCHAR(30) NOT NULL,
    "descricao" VARCHAR(200),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consultorios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disponibilidades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "medico_id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "especialidade_id" VARCHAR(64) NOT NULL,
    "dias_semana" SMALLINT[],
    "hora_inicio" TIME(0) NOT NULL,
    "hora_fim" TIME(0) NOT NULL,
    "duracao_minutos" SMALLINT NOT NULL,
    "vigencia_inicio" DATE,
    "vigencia_fim" DATE,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disponibilidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloqueios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "medico_id" UUID NOT NULL,
    "unidade_id" UUID,
    "inicio" TIMESTAMPTZ(3) NOT NULL,
    "fim" TIMESTAMPTZ(3) NOT NULL,
    "motivo" VARCHAR(200),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_por_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bloqueios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chamados" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "paciente_id" UUID NOT NULL,
    "unidade_id" UUID NOT NULL,
    "especialidade_id" VARCHAR(64) NOT NULL,
    "tipo" "tipo_chamado" NOT NULL,
    "medico_id" UUID,
    "consultorio_id" UUID,
    "inicio" TIMESTAMPTZ(3),
    "fim" TIMESTAMPTZ(3),
    "status" "status_chamado" NOT NULL,
    "urgencia" "urgencia" NOT NULL DEFAULT 'rotina',
    "origem" "origem_chamado" NOT NULL,
    "chegada_confirmada_em" TIMESTAMPTZ(3),
    "chegada_confirmada_por_id" UUID,
    "aceite_em" TIMESTAMPTZ(3),
    "atendimento_inicio_em" TIMESTAMPTZ(3),
    "atendimento_fim_em" TIMESTAMPTZ(3),
    "cancelado_em" TIMESTAMPTZ(3),
    "cancelado_por_id" UUID,
    "motivo_cancelamento" VARCHAR(300),
    "lembrete_24h_enviado_em" TIMESTAMPTZ(3),
    "lembrete_2h_enviado_em" TIMESTAMPTZ(3),
    "criado_por_id" UUID NOT NULL,
    "criado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chamados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- CreateIndex
CREATE INDEX "usuarios_unidade_id_perfil_idx" ON "usuarios"("unidade_id", "perfil");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_token_hash_key" ON "sessoes"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_substituida_por_id_key" ON "sessoes"("substituida_por_id");

-- CreateIndex
CREATE INDEX "sessoes_usuario_id_revogada_em_idx" ON "sessoes"("usuario_id", "revogada_em");

-- CreateIndex
CREATE INDEX "sessoes_familia_id_idx" ON "sessoes"("familia_id");

-- CreateIndex
CREATE UNIQUE INDEX "redefinicoes_senha_token_hash_key" ON "redefinicoes_senha"("token_hash");

-- CreateIndex
CREATE INDEX "redefinicoes_senha_usuario_id_idx" ON "redefinicoes_senha"("usuario_id");

-- CreateIndex
CREATE INDEX "auditoria_recurso_recurso_id_em_idx" ON "auditoria"("recurso", "recurso_id", "em");

-- CreateIndex
CREATE INDEX "auditoria_ator_id_em_idx" ON "auditoria"("ator_id", "em");

-- CreateIndex
CREATE INDEX "auditoria_unidade_id_em_idx" ON "auditoria"("unidade_id", "em");

-- CreateIndex
CREATE INDEX "especialidades_ativa_nome_idx" ON "especialidades"("ativa", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "unidades_cnpj_key" ON "unidades"("cnpj");

-- CreateIndex
CREATE INDEX "unidades_ativa_nome_idx" ON "unidades"("ativa", "nome");

-- CreateIndex
CREATE INDEX "unidades_bairro_busca_idx" ON "unidades"("bairro_busca");

-- CreateIndex
CREATE INDEX "unidades_especialidades_especialidade_id_idx" ON "unidades_especialidades"("especialidade_id");

-- CreateIndex
CREATE UNIQUE INDEX "medicos_usuario_id_key" ON "medicos"("usuario_id");

-- CreateIndex
CREATE INDEX "medicos_ativo_nome_idx" ON "medicos"("ativo", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "medicos_conselho_key" ON "medicos"("conselho_tipo", "conselho_uf", "conselho_numero");

-- CreateIndex
CREATE INDEX "medicos_unidades_unidade_id_idx" ON "medicos_unidades"("unidade_id");

-- CreateIndex
CREATE INDEX "medicos_especialidades_especialidade_id_idx" ON "medicos_especialidades"("especialidade_id");

-- CreateIndex
CREATE INDEX "consultorios_unidade_id_ativo_idx" ON "consultorios"("unidade_id", "ativo");

-- CreateIndex
CREATE UNIQUE INDEX "consultorios_unidade_identificacao_key" ON "consultorios"("unidade_id", "identificacao");

-- CreateIndex
CREATE INDEX "disponibilidades_medico_id_ativa_idx" ON "disponibilidades"("medico_id", "ativa");

-- CreateIndex
CREATE INDEX "disponibilidades_unidade_id_especialidade_id_ativa_idx" ON "disponibilidades"("unidade_id", "especialidade_id", "ativa");

-- CreateIndex
CREATE INDEX "bloqueios_medico_id_inicio_idx" ON "bloqueios"("medico_id", "inicio");

-- CreateIndex
CREATE INDEX "chamados_paciente_id_criado_em_idx" ON "chamados"("paciente_id", "criado_em" DESC);

-- CreateIndex
CREATE INDEX "chamados_unidade_id_status_inicio_idx" ON "chamados"("unidade_id", "status", "inicio");

-- CreateIndex
CREATE INDEX "chamados_medico_id_status_inicio_idx" ON "chamados"("medico_id", "status", "inicio");

-- CreateIndex
CREATE INDEX "chamados_unidade_id_status_urgencia_chegada_confirmada_em_idx" ON "chamados"("unidade_id", "status", "urgencia", "chegada_confirmada_em");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_substituida_por_id_fkey" FOREIGN KEY ("substituida_por_id") REFERENCES "sessoes"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "redefinicoes_senha" ADD CONSTRAINT "redefinicoes_senha_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_ator_id_fkey" FOREIGN KEY ("ator_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria" ADD CONSTRAINT "auditoria_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidades_especialidades" ADD CONSTRAINT "unidades_especialidades_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unidades_especialidades" ADD CONSTRAINT "unidades_especialidades_especialidade_id_fkey" FOREIGN KEY ("especialidade_id") REFERENCES "especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicos_unidades" ADD CONSTRAINT "medicos_unidades_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicos_unidades" ADD CONSTRAINT "medicos_unidades_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicos_especialidades" ADD CONSTRAINT "medicos_especialidades_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medicos_especialidades" ADD CONSTRAINT "medicos_especialidades_especialidade_id_fkey" FOREIGN KEY ("especialidade_id") REFERENCES "especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consultorios" ADD CONSTRAINT "consultorios_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_especialidade_id_fkey" FOREIGN KEY ("especialidade_id") REFERENCES "especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueios" ADD CONSTRAINT "bloqueios_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueios" ADD CONSTRAINT "bloqueios_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueios" ADD CONSTRAINT "bloqueios_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_unidade_id_fkey" FOREIGN KEY ("unidade_id") REFERENCES "unidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_especialidade_id_fkey" FOREIGN KEY ("especialidade_id") REFERENCES "especialidades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_consultorio_id_fkey" FOREIGN KEY ("consultorio_id") REFERENCES "consultorios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_chegada_confirmada_por_id_fkey" FOREIGN KEY ("chegada_confirmada_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_cancelado_por_id_fkey" FOREIGN KEY ("cancelado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chamados" ADD CONSTRAINT "chamados_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- ESCRITO À MÃO (ADR 0019 e ADR 0021)
-- O Prisma não declara índice parcial, CHECK nem gatilho no schema.prisma.
-- Toda migration nova deve preservar o que está abaixo: se o Prisma gerar
-- DROP INDEX "chamados_medico_horario" ou "chamados_paciente_horario", apague
-- essa linha antes de aplicar.
-- =============================================================================

-- RN02: sem overbooking. O próprio chamado é a reserva: um horário de médico
-- tem no máximo um chamado que o ocupa. Cancelar ou marcar falta libera.
-- Violação -> 409 HORARIO_INDISPONIVEL.
CREATE UNIQUE INDEX chamados_medico_horario ON chamados (medico_id, inicio) WHERE status NOT IN ('cancelado','nao_compareceu');

-- RN03: o paciente não tem dois chamados ativos começando no mesmo horário.
CREATE UNIQUE INDEX chamados_paciente_horario ON chamados (paciente_id, inicio) WHERE status NOT IN ('cancelado','nao_compareceu');

-- usuarios ---------------------------------------------------------------------
ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_cpf_formato CHECK (cpf ~ '^[0-9]{11}$'),
  ADD CONSTRAINT usuarios_email_minusculo CHECK (email = lower(email)),
  ADD CONSTRAINT usuarios_telefone_formato CHECK (telefone IS NULL OR telefone ~ '^55[0-9]{10,11}$'),
  -- RN19: recepcionista e manutenção pertencem a exatamente uma unidade; os
  -- demais perfis não têm unidade nesta coluna (médico: medicos_unidades).
  ADD CONSTRAINT usuarios_unidade_conforme_perfil CHECK ((perfil IN ('recepcionista', 'manutencao')) = (unidade_id IS NOT NULL)),
  -- Só o pré-cadastro (WhatsApp, RF30) fica sem senha.
  ADD CONSTRAINT usuarios_senha_conforme_status CHECK (senha_hash IS NOT NULL OR status = 'pre_cadastro'),
  ADD CONSTRAINT usuarios_expo_push_tokens_presente CHECK (expo_push_tokens IS NOT NULL);

-- especialidades e unidades ----------------------------------------------------
ALTER TABLE especialidades
  ADD CONSTRAINT especialidades_palavras_chave_presente CHECK (palavras_chave IS NOT NULL);

ALTER TABLE unidades
  ADD CONSTRAINT unidades_cnpj_formato CHECK (cnpj ~ '^[0-9]{14}$'),
  ADD CONSTRAINT unidades_endereco_uf_formato CHECK (endereco_uf ~ '^[A-Z]{2}$'),
  ADD CONSTRAINT unidades_endereco_cep_formato CHECK (endereco_cep ~ '^[0-9]{8}$'),
  ADD CONSTRAINT unidades_telefone_formato CHECK (telefone ~ '^55[0-9]{10,11}$');

-- medicos ----------------------------------------------------------------------
ALTER TABLE medicos
  ADD CONSTRAINT medicos_conselho_numero_formato CHECK (conselho_numero ~ '^[1-9][0-9]{0,6}$'),
  ADD CONSTRAINT medicos_conselho_uf_formato CHECK (conselho_uf ~ '^[A-Z]{2}$');

-- agenda -----------------------------------------------------------------------
ALTER TABLE disponibilidades
  ADD CONSTRAINT disponibilidades_fim_depois_do_inicio CHECK (hora_fim > hora_inicio),
  ADD CONSTRAINT disponibilidades_duracao_valida CHECK (duracao_minutos BETWEEN 5 AND 240),
  ADD CONSTRAINT disponibilidades_dias_semana_validos CHECK (
    dias_semana IS NOT NULL
    AND cardinality(dias_semana) BETWEEN 1 AND 7
    AND dias_semana <@ ARRAY[0, 1, 2, 3, 4, 5, 6]::smallint[]
  ),
  ADD CONSTRAINT disponibilidades_vigencia_valida CHECK (
    vigencia_inicio IS NULL OR vigencia_fim IS NULL OR vigencia_fim >= vigencia_inicio
  );

ALTER TABLE bloqueios
  ADD CONSTRAINT bloqueios_fim_depois_do_inicio CHECK (fim > inicio);

ALTER TABLE chamados
  -- ADR-012 do DAES: o agendado tem médico e horário; o espontâneo não tem horário.
  ADD CONSTRAINT chamados_horario_conforme_tipo CHECK (
    (tipo = 'agendado' AND medico_id IS NOT NULL AND inicio IS NOT NULL AND fim IS NOT NULL)
    OR (tipo = 'espontaneo' AND inicio IS NULL AND fim IS NULL)
  ),
  ADD CONSTRAINT chamados_fim_depois_do_inicio CHECK (fim > inicio);

-- sessões e redefinição de senha -----------------------------------------------
ALTER TABLE sessoes
  ADD CONSTRAINT sessoes_expira_depois_de_criada CHECK (expira_em > criado_em);

ALTER TABLE redefinicoes_senha
  ADD CONSTRAINT redefinicoes_senha_expira_depois_de_criada CHECK (expira_em > criado_em);

-- RF34: a trilha de auditoria é só de inserção. Nenhum UPDATE ou DELETE passa,
-- nem pela API nem por SQL direto. (TRUNCATE exige ser dono da tabela e fica de
-- fora para os testes de integração limparem o banco de testes.)
CREATE FUNCTION auditoria_somente_insercao() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'A auditoria é somente de inserção: % recusado.', TG_OP
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

CREATE TRIGGER auditoria_somente_insercao
  BEFORE UPDATE OR DELETE ON auditoria
  FOR EACH STATEMENT EXECUTE FUNCTION auditoria_somente_insercao();
