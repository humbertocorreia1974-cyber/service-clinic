# API do Service Clinic (JGNEXT API v1)

Sua aplicação expõe uma API REST para você (ou o seu sistema) integrar.

## Autenticação
Header `x-api-key: SUA_CHAVE` em toda requisição.
As chaves ficam na variável de ambiente `APP_API_KEYS` (separadas por vírgula).
Peça/gere chaves no painel da JGNEXT.

## Endpoints

```
GET  /api/v1/{recurso}?limit=50&offset=0   → lista paginada
GET  /api/v1/{recurso}?id={id}             → um registro
```

### Recursos disponíveis
- `user`
- `project`
- `client`
- `technician`
- `equipment`
- `service-order`
- `service-order-checklist`
- `service-order-photo`
- `service-order-signature`
- `contract`
- `visit`
- `invoice`
- `invoice-item`
- `payment`
- `part`
- `stock-movement`
- `lead`
- `laudo`
- `notification`
- `audit-log`
- `medical-record`
- `medical-record-access`
- `document`
- `insurance-plan`
- `specialty`
- `professional`
- `patient`
- `appointment`
- `vaccination`
- `controlled-medication`
- `blog-post`
- `service`
- `city`
- `consent`
- `health-check`

### Exemplo
```bash
curl -H "x-api-key: SUA_CHAVE" "https://SEU-APP/api/v1/user?limit=10"
```

## Escrita (POST / PATCH / DELETE)
Disponível — **desativada por padrão**. Ative com `APP_API_WRITE=true` no ambiente.

```
POST   /api/v1/{recurso}            body JSON  → cria (201)
PATCH  /api/v1/{recurso}?id={id}    body JSON  → atualiza
DELETE /api/v1/{recurso}?id={id}               → remove
```

Sempre com `x-api-key`. Comece só com leitura; ligue a escrita quando o seu
integrador estiver pronto.
