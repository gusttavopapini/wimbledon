-- Roda só na primeira inicialização do volume (docker-entrypoint-initdb.d).
-- O banco de testes fica separado do de desenvolvimento: os testes de
-- integração limpam as tabelas a cada arquivo.
CREATE DATABASE saude_teste OWNER saude;
