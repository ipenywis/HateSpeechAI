#!/bin/bash

docker run -i -t \
  --network=host \
  --device=/dev/kfd \
  --device=/dev/dri \
  --group-add video \
  --cap-add=SYS_PTRACE \
  --security-opt seccomp=unconfined \
  --workdir=/tf_docker \
  -v $HOME/Source/Masters_Project:/tf_docker rocm/tensorflow:personal /bin/bash
