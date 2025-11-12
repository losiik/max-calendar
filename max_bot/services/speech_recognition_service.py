import json
import wave
import soundfile
import logging

from vosk import Model, KaldiRecognizer


class SpeechRecognitionService:
    def __init__(self):
        model_path = './vosk-model-small-ru-0.22'
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

        # Получаем окончательный результат
        final_result = recognizer.FinalResult()
        return json.loads(final_result)["text"]
