# Monitoramento em Tempo Real da Distribuição de Caixas Térmicas no Depósito da Soprano por meio da Visão Computacional

Aplicação que identifica, classifica e contabiliza as **caixas térmicas** armazenadas nas ruas do Centro de Distribuição da Soprano a partir de **imagens e vídeos** capturados no depósito. O processamento usa um modelo **YOLO** treinado com fotos do próprio CD, rastreia cada caixa ao longo do vídeo com **ByteTrack** e transmite o resultado ao painel web **em tempo real** via WebSocket.

O repositório reúne as duas partes do sistema:

| Pasta | Conteúdo | Stack |
|---|---|---|
| [`back-end/`](back-end) | API de inferência, preparação do dataset e treinamento do modelo | Python · FastAPI · Ultralytics YOLO11 · OpenCV  |
| [`front-end/`](front-end) | Dashboard de monitoramento | React 19 · TypeScript · Vite · Material UI  |

---

## Contexto e objetivo

Conferir manualmente quais caixas térmicas estão em cada rua do depósito é lento e sujeito a erro. Este projeto propõe automatizar essa conferência: um operador grava um vídeo (ou tira uma foto) percorrendo a rua, envia pelo painel, e o sistema devolve:

- o **vídeo/imagem anotado** com as caixas detectadas;
- a **contagem por tipo de caixa** (cor/modelo);
- a **sequência de posições** identificadas na rua, exibida em um mapa;
- o acompanhamento do processamento **frame a frame, ao vivo**.

## Como funciona

**Fluxo de um vídeo**

1. O front envia o arquivo e a rua (`A`, `B`, `C` ou `D`) para `POST /videos`. A API grava o upload em blocos de 1 MB (limite de 500 MB) e responde `202` com um `job_id`.
2. A tarefa entra em uma fila de **um vídeo por vez** (`ThreadPoolExecutor(max_workers=1)`), evitando concorrência no modelo e estouro de memória.
3. O vídeo é **otimizado com ffmpeg** (até 1280×720, 30 fps, H.264, sem áudio) para reduzir o custo de inferência de vídeos gravados em alta resolução no celular.
4. Cada frame passa por `model.track()` (YOLO11 + ByteTrack, confiança mínima 0,25, `imgsz=640`).
5. Um objeto só é **contabilizado** depois de rastreado por pelo menos **1,5 s**; rastros que somem por mais de 5 s sem confirmação são descartados. Isso reduz falsos positivos de detecções momentâneas.
6. Durante o processamento, a API publica o frame anotado mais recente (≈ 6–7 fps, reduzido para 720 px de largura, JPEG 70) no WebSocket, e o front exibe a análise ao vivo.
7. Ao terminar, o vídeo anotado fica disponível para visualização e download. Tarefas e arquivos finalizados são removidos após **1 hora**.

**Fluxo de uma imagem**: `POST /images` processa de forma síncrona e devolve as detecções (ordenadas da esquerda para a direita) e a imagem anotada em Base64.

## Estrutura do repositório

```
MonitoramentoCV/
├── back-end/
│   ├── src/
│   │   ├── api.py               # FastAPI: rotas, fila de tarefas, WebSocket
│   │   ├── video_processor.py   # detecção + rastreamento + contagem em vídeo
│   │   ├── image_processor.py   # detecção em imagem
│   │   ├── prepare_daset.py     # consolida exports do CVAT em dataset YOLO
│   │   ├── train.py             # treinamento do YOLO11n
│   │   └── utils/
│   │       ├── model.py             # carrega models/best.pt (cache único)
│   │       ├── video_optimizer.py   # pré-processamento com ffmpeg
│   │       └── convert_images.py    # conversão HEIC (iPhone) → JPG
│   ├── datasets/                # exports de anotação do CVAT (parte 1 e 2)
│   ├── data/detector/           # dataset final (images/labels, train/val, data.yaml)
│   ├── models/best.pt           # modelo treinado usado na inferência
│   ├── yolo11n.pt               # pesos pré-treinados de partida
│   └── requirements.txt
└── front-end/
    └── src/
        ├── pages/Dashboard.tsx
        ├── components/          # InspectionPreview, PositionMap, InspectionResults…
        ├── hooks/useInspection.ts
        ├── services/            # chamadas à API
        └── types/
```

## Pré-requisitos

- **Python 3.11+**
- **Node.js 20+** e npm
- **ffmpeg** instalado e disponível no `PATH` (obrigatório para processar vídeos)

## Executando o projeto

### 1. Back-end (API)

```bash
cd back-end

python -m venv .venv

# Windows
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt

# rodar a partir da pasta back-end para iniciar a API, pois os imports usam o pacote "src"
uvicorn src.api:app --host 127.0.0.1 --port 8000
```

A API sobe em `http://localhost:8000` (documentação interativa em `http://localhost:8000/docs`). 


### 2. Front-end (dashboard)

```bash
cd front-end
npm install

# rodar a partir da pasta front-end para iniciar o projeto
npm run dev
```

```env
VITE_API_URL=http://localhost:8000
```


## API

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Status da API e uso de memória do processo |
| `POST` | `/videos` | Envia um vídeo (`file`) e a rua (`street_id`: A–D). Formatos: MP4, AVI, MOV, MKV, WEBM · máx. 500 MB. Retorna `202` com `job_id` |
| `GET` | `/jobs/{job_id}` | Status (`queued`, `processing`, `completed`, `failed`), etapa (`optimizing`, `detecting`…), progresso, caixas rastreadas e resumo por classe |
| `WS` | `/ws/jobs/{job_id}` | Stream binário dos frames anotados (JPEG) durante o processamento |
| `GET` | `/jobs/{job_id}/video` | Vídeo processado para exibição inline |
| `GET` | `/jobs/{job_id}/download` | Download do vídeo processado (`<nome>_detectado.mp4`) |
| `POST` | `/images` | Envia uma imagem (`file`) e a rua (`street_id`). Formatos: JPG, PNG, BMP, WEBP · máx. 25 MB. Retorna detecções + imagem anotada em Base64 |

Exemplo de `tracking_summary` retornado:

```json
{
  "total": 12,
  "caixa-preta": 2,
  "caixa-verde": 4,
  "caixa-azul": 3,
  "caixa-cinza": 1,
  "caixa-vermelha": 0,
  "caixa-fechada": 2,
  "classes_nao_reconhecidas": {}
}
```

## Pipeline de treinamento do modelo

O modelo `models/best.pt` já está versionado, então **não é preciso treinar para rodar a aplicação**. O processo abaixo documenta como ele foi gerado e como retreiná-lo.


1. **Coleta** — fotos das caixas tiradas no CD com iPhone (formato `.HEIC`), com variação de iluminação e ângulo.
2. **Conversão** — `src/utils/convert_images.py` converte `.HEIC/.HEIF` para JPG (qualidade 95) mantendo a estrutura de pastas.
3. **Anotação** — bounding boxes feitas no **CVAT**. Como o plano gratuito limita exports a ~200 arquivos e não exporta as imagens, as anotações foram exportadas em duas partes, só com os rótulos YOLO:
   - `datasets/product_images_part_1` → classes 0, 1, 2
   - `datasets/product_images_part_2` → classes 3, 4, 5
4. **Preparação** — `src/prepare_daset.py` casa cada rótulo com sua imagem, valida IDs e coordenadas normalizadas, recusa nomes duplicados, embaralha com semente fixa (42) e separa **80% treino / 20% validação**, gerando `data/detector/` e o `data.yaml`. Se houver qualquer inconsistência, nenhum dataset é criado.
5. **Treinamento** — `src/train.py` faz *fine-tuning* do `yolo11n.pt`: 100 épocas, `imgsz=640`, `batch=4`, *early stopping* com paciência 15. O melhor peso é copiado para `models/best.pt`.

```bash
cd back-end
python src/utils/convert_images.py
python src/prepare_daset.py
python src/train.py
```

**Dataset atual**

| Conjunto | Imagens |
|---|---|
| Treino | 273 |
| Validação | 68 |
| **Total** | **341** |

Instâncias anotadas por classe: `caixa-preta` 25 · `caixa-verde` 76 · `caixa-azul` 53 · `caixa-cinza` 38 · `caixa-vermelha` 50 · `caixa-fechada` 108.

O modelo final atingiu cerca de **90% de precisão**, considerado um bom resultado para o volume de fotos e a variação de luminosidade do depósito. As métricas detalhadas de cada execução (mAP, matriz de confusão, curvas) ficam em `outputs/detector-caixas/`, que não é versionado.

## Dashboard

O painel ("Centro de Distribuição Soprano · Visão Geral") é composto por:

- **Envio de inspeção** — seleção da rua (A–D) e upload de imagem (JPG, PNG, WebP) ou vídeo (MP4, MOV), com barra de progresso, etapa atual e **visualização ao vivo** dos frames anotados.
- **Mapa de posições** — grade por rua com a sequência de caixas identificadas (`A-01`, `A-02`…), colorida por status, com detalhe de classe e confiança ao clicar.
- **Resultados da inspeção** — tabela com posição, classificação, confiança e sinalização de revisão.
- **Filtro por rua** e histórico das inspeções concluídas, salvo no `localStorage` do navegador.
