# atualizacao dos dados de eleitores
library(tidyverse)

eleitorado_2022 <- read_csv("~/Downloads/quantitativo_eleitores-uf_2022 - quantitativo_eleitores-uf_2022.csv")
dados <- read_csv("~/Downloads/final_resultados - final_resultados (5).csv")

dados_n <- dados %>%
  select(-c(23:26)) %>%
  left_join(eleitorado_2022, by = c("sg_uf" = "uf")) %>%
  replace(is.na(.), "-") %>%
  mutate(qtd_elei_2022_str = paste0("A UF tem ", qtd_elei_2022, " eleitores em 2022"),
         perc_elei_2022_str = paste0("Isso equivale a ", perc_elei_2022, " dos eleitores do Brasil")) 

write.csv(dados_n, "final-resultados_28jul2022.csv", row.names = F)

