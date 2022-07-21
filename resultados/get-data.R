library(tidyverse)
library(data.table)

resultado_2018 <- fread("~/Downloads/resultados/votacao_candidato_munzona_2018/votacao_candidato_munzona_2018_BR.csv",
                        encoding = "Latin-1",
                        select = c("ANO_ELEICAO", "NR_TURNO", "SG_UF", "DS_CARGO", "NM_URNA_CANDIDATO", "SG_PARTIDO", "DS_SIT_TOT_TURNO", "QT_VOTOS_NOMINAIS"))

resultado_2014 <- fread("~/Downloads/resultados/votacao_candidato_munzona_2014/votacao_candidato_munzona_2014_BR.csv",
                        encoding = "Latin-1",
                        select = c("ANO_ELEICAO", "NR_TURNO", "SG_UF", "DS_CARGO", "NM_URNA_CANDIDATO", "SG_PARTIDO", "DS_SIT_TOT_TURNO", "QT_VOTOS_NOMINAIS"))

resultado_2010 <- fread("~/Downloads/resultados/votacao_candidato_munzona_2010/votacao_candidato_munzona_2010_BR.csv",
                        encoding = "Latin-1",
                        select = c("ANO_ELEICAO", "NR_TURNO", "SG_UF", "DS_CARGO", "NM_URNA_CANDIDATO", "SG_PARTIDO", "DS_SIT_TOT_TURNO", "QT_VOTOS_NOMINAIS"))

resultado_2006 <- fread("~/Downloads/resultados/votacao_candidato_munzona_2006/votacao_candidato_munzona_2006_BR.txt",
                        encoding = "Latin-1",
                        select = c("V3", "V4", "V6", "V16", "V15", "V24", "V22", "V29"),
                        col.names = c("ANO_ELEICAO", "NR_TURNO", "SG_UF", "DS_CARGO", 
                                   "NM_URNA_CANDIDATO", "SG_PARTIDO", "DS_SIT_TOT_TURNO", "QT_VOTOS_NOMINAIS"))

resultado_2002 <- fread("~/Downloads/resultados/votacao_candidato_munzona_2002/votacao_candidato_munzona_2002_BR.txt",
                        encoding = "Latin-1",
                        select = c("V3", "V4", "V6", "V16", "V15", "V24", "V22", "V29"),
                        col.names = c("ANO_ELEICAO", "NR_TURNO", "SG_UF", "DS_CARGO", 
                                      "NM_URNA_CANDIDATO", "SG_PARTIDO", "DS_SIT_TOT_TURNO", "QT_VOTOS_NOMINAIS"))

resultados <- bind_rows(resultado_2018, resultado_2014, resultado_2010, resultado_2006, resultado_2002)

write_rds(resultados, "resultados_all.rds")

votos_turno <- resultados %>%
  group_by(ANO_ELEICAO, NR_TURNO, SG_UF) %>%
  summarise(votos_turno = sum(QT_VOTOS_NOMINAIS))

tidy_resultados <- resultados %>%
  group_by(ANO_ELEICAO, NR_TURNO, SG_UF, NM_URNA_CANDIDATO, SG_PARTIDO, DS_SIT_TOT_TURNO) %>%
  summarise(votos_cand = sum(QT_VOTOS_NOMINAIS)) %>%
  left_join(votos_turno, by = c("ANO_ELEICAO", "NR_TURNO", "SG_UF")) %>%
  mutate(perc_cand = round(votos_cand / votos_turno, 4) * 100) %>%
  filter(ANO_ELEICAO %in% c(2002, 2006, 2010, 2014) & SG_PARTIDO %in% c("PT", "PSDB") |
         ANO_ELEICAO == 2018 & SG_PARTIDO %in% c("PT", "PSL")) %>%
  mutate(DS_SIT_TOT_TURNO = str_replace_all(DS_SIT_TOT_TURNO, "#NULO#", "2º TURNO")) %>%
  mutate(NM_URNA_CANDIDATO = str_to_title(NM_URNA_CANDIDATO),
         DS_SIT_TOT_TURNO = str_to_sentence(DS_SIT_TOT_TURNO))
  
#write_rds(tidy_resultados, "tidy_resultados.rds")

# eleitores
eleitores_2022 <- fread("~/Downloads/_quantidade_de_eleitores_por_município-região_-_região-uf-município.csv", encoding="Latin-1")

tidy_eleitores <- eleitores_2022 %>%
  janitor::clean_names() %>%
  select(c(2, 3)) %>%
  rename("qtd_elei_2022" = quantidade,
         "sg_uf" = abrangencia) %>%
  filter(sg_uf != "") %>%
  mutate(qtd_elei_2022 = as.integer(str_remove_all(qtd_elei_2022, "\\.")),
         perc_elei_2022 = round(qtd_elei_2022 / sum(qtd_elei_2022), 4) * 100)
  
# regioes
norte <- data.frame(regiao = "Norte", uf = c("AM", "AC", "AP", "PA", "TO", "RO", "RR"))
nordeste <- data.frame(regiao = "Nordeste", uf = c("MA", "PI", "CE", "RN", "PE", "PB", "SE", "AL", "BA"))
centro_oeste <- data.frame(regiao = "Centro-Oeste", uf = c("DF", "MT", "MS", "GO"))
sudeste <- data.frame(regiao = "Sudeste", uf = c("SP", "RJ", "ES", "MG"))
sul <- data.frame(regiao = "Sul", uf = c("RS", "SC", "PR"))
exterior <- data.frame(regiao = "Exterior", uf = "ZZ")
voto_transito <- data.frame(regiao = "Voto em trânsito", uf = "VT")

regioes <- bind_rows(norte, nordeste, centro_oeste, sudeste, sul, exterior, voto_transito)

# creating final file
pt_resultados <- tidy_resultados %>%
  filter(SG_PARTIDO == "PT") %>%
  rename("CANDIDATO_1" = NM_URNA_CANDIDATO,
         "PARTIDO_1" = SG_PARTIDO,
         "SITUACAO_1" = DS_SIT_TOT_TURNO,
         "VOTOS_1" = votos_cand,
         "VOTOS_TOTAL" = votos_turno,
         "PERC_1" = perc_cand)

not_pt_resultados <- tidy_resultados %>%
  filter(SG_PARTIDO != "PT") %>%
  select(-votos_turno) %>%
  rename("CANDIDATO_2" = NM_URNA_CANDIDATO,
         "PARTIDO_2" = SG_PARTIDO,
         "SITUACAO_2" = DS_SIT_TOT_TURNO,
         "VOTOS_2" = votos_cand,
         "PERC_2" = perc_cand)

final_resultados <- pt_resultados %>%
  left_join(not_pt_resultados, by = c("ANO_ELEICAO", "NR_TURNO", "SG_UF")) %>%
  relocate("CANDIDATO_2", .after = "CANDIDATO_1") %>%
  relocate("SITUACAO_2", .after = "SITUACAO_1") %>%
  relocate("PARTIDO_2", .after = "PARTIDO_1") %>%
  relocate("VOTOS_2", .after = "VOTOS_1") %>%
  relocate("PERC_2", .after = "PERC_1") %>%
  mutate(diferenca_pp = PERC_1 - PERC_2,
         diferenca_absoluta = VOTOS_1 - VOTOS_2) %>%
  janitor::clean_names() %>%
  left_join(regioes, by = c("sg_uf" = "uf")) %>%
  relocate(regiao, .after = "sg_uf") %>%
  left_join(tidy_eleitores, by = "sg_uf")

# write(jsonlite::toJSON(final_resultados), "election-data.json")
