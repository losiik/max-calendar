import json
import wave
import soundfile
import logging
import os

from vosk import Model, KaldiRecognizer


class SpeechRecognitionService:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))

        model_path = os.path.join(base_dir, "..", "vosk-model-small-ru-0.22")
        model_path = os.path.abspath(model_path)  # нормализуем путь

        logging.info(f"Загружаю модель из: {model_path}")

        if not os.path.exists(model_path):
            raise FileNotFoundError(f"❌ Модель не найдена по пути: {model_path}")
        self.model = Model(model_path)

    async def recognize_from_bytes(self, file_path):
        data, samplerate = soundfile.read(file_path)
        soundfile.write(file_path, data, samplerate)

        wf = wave.open(file_path, "rb")

        recognizer = KaldiRecognizer(self.model, wf.getframerate())

        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if recognizer.AcceptWaveform(data):
                result = recognizer.Result()
                logging.info(json.loads(result)["text"])
            else:
                partial_result = recognizer.PartialResult()
                logging.info(json.loads(partial_result)["partial"])

        final_result = recognizer.FinalResult()
        return json.loads(final_result)["text"]
