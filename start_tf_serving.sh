#!/bin/bash

MODEL_DIR="$(pwd)/model/savedModels"

docker run -t --rm -p 8501:8501 -v "$MODEL_DIR/v2:/models/hate_speech/2" -e MODEL_NAME=hate_speech tensorflow/serving &
