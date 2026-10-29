# Serviço responsável pelo processamento de imagens utilizando YOLO.
# Realiza a detecção de objetos e salva a imagem com as identificações.

from pathlib import Path

import cv2
from ultralytics import YOLO

from src.utils.model import get_model

# Diretório destinado ao armazenamento das imagens processadas.
ROOT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT_DIR / "outputs" / "predictions"

# Nível mínimo de confiança para considerar uma detecção.
CONFIDENCE = 0.25

# Processa uma imagem utilizando o modelo de detecção YOLO.
def process_image(
    input_path: str | Path,
    model: YOLO | None = None,
) -> tuple[Path, list[dict]]:
    input_path = Path(input_path).resolve()

    # Valida a existência e o formato da imagem.
    if not input_path.is_file():
        raise FileNotFoundError(
            f"Imagem não encontrada: {input_path}"
        )

    if input_path.suffix.lower() not in {
        ".jpg", ".jpeg", ".png", ".bmp", ".webp"
    }:
        raise ValueError(
            f"Formato de imagem não suportado: {input_path.suffix}"
        )

    # Carrega o modelo e executa a detecção dos objetos.
    model = model or get_model()

    results = model.predict(
        source=str(input_path),
        conf=CONFIDENCE,
        verbose=False,
    )

    # Gera a imagem com as detecções identificadas.
    annotated_image = results[0].plot()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Define o caminho para salvar a imagem processada.
    output_path = OUTPUT_DIR / f"{input_path.stem}_detectado.jpg"

    # Salva a imagem e verifica se a operação foi concluída.
    if not cv2.imwrite(str(output_path), annotated_image):
        raise RuntimeError(
            f"Não foi possível salvar a imagem: {output_path}"
        )

    # Organiza as caixas da esquerda para a direita.
    detections = []

    boxes = results[0].boxes

    if boxes is not None:
        class_ids = boxes.cls.int().cpu().tolist()
        confidences = boxes.conf.cpu().tolist()
        coordinates = boxes.xyxy.cpu().tolist()

        for order, (class_id, confidence, coordinate) in enumerate(
            zip(class_ids, confidences, coordinates),
            start=1,
        ):
            class_name = results[0].names.get(
                class_id,
                str(class_id),
            )

            detections.append(
                {
                    "id": order,
                    "order": order,
                    "class": class_name,
                    "confidence": round(float(confidence), 4),
                    "first_frame": 0,
                    "last_frame": 0,
                    "detection_count": 1,
                    "x1": round(float(coordinate[0]), 2),
                    "y1": round(float(coordinate[1]), 2),
                    "x2": round(float(coordinate[2]), 2),
                    "y2": round(float(coordinate[3]), 2),
                }
            )

    detections.sort(key=lambda item: item["x1"])

    for order, detection in enumerate(detections, start=1):
        detection["order"] = order
        detection["id"] = order

    # Retorna o caminho e as caixas detectadas.
    return output_path, detections