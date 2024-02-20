import { useEffect, useMemo, useRef, useState } from "react";
import { MeetingDetailsScreen } from "../MeetingDetailsScreen";
import { createMeeting, getToken, validateMeeting } from "../../api";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import SettingDialogueBox from "../SettingDialogueBox";
import ConfirmBox from "../ConfirmBox";
import { Constants } from "@videosdk.live/react-sdk";
import useIsMobile from "../../hooks/useIsMobile";
import { createPopper } from "@popperjs/core";
import WebcamOffIcon from "../../icons/WebcamOffIcon";
import WebcamOnIcon from "../../icons/Bottombar/WebcamOnIcon";
import MicOffIcon from "../../icons/MicOffIcon";
import MicOnIcon from "../../icons/Bottombar/MicOnIcon";
import BackButton from './../../../../../components/common/BackButton';
import Swal from "sweetalert2";

export function JoiningScreen({
  participantName,
  setParticipantName,
  setMeetingId,
  setToken,
  setSelectedMic,
  setSelectedWebcam,
  onClickStartMeeting,
  micEnabled,
  webcamEnabled,
  setWebcamOn,
  setMicOn,
  setMeetingMode,
  meetingMode,
}) {
  const [setting, setSetting] = useState("video");
  const [{ webcams, mics }, setDevices] = useState({
    devices: [],
    webcams: [],
    mics: [],
  });

  const [videoTrack, setVideoTrack] = useState(null);

  const [dlgMuted, setDlgMuted] = useState(false);
  const [dlgDevices, setDlgDevices] = useState(false);

  const videoPlayerRef = useRef();
  const popupVideoPlayerRef = useRef();
  const popupAudioPlayerRef = useRef();

  const videoTrackRef = useRef();
  const audioTrackRef = useRef();
  const audioAnalyserIntervalRef = useRef();

  const [settingDialogueOpen, setSettingDialogueOpen] = useState(false);

  const [audioTrack, setAudioTrack] = useState(null);

  const handleClickOpen = () => {
    setSettingDialogueOpen(true);
  };

  const handleClose = (value) => {
    setSettingDialogueOpen(false);
  };

  const isMobile = useIsMobile();

  const webcamOn = useMemo(() => !!videoTrack, [videoTrack]);
  const micOn = useMemo(() => !!audioTrack, [audioTrack]);

  const _handleTurnOffWebcam = () => {
    const videoTrack = videoTrackRef.current;

    if (videoTrack) {
      videoTrack.stop();
      setVideoTrack(null);
      setWebcamOn(false);
    }
  };
  const _handleTurnOnWebcam = () => {
    const videoTrack = videoTrackRef.current;

    if (!videoTrack) {
      getDefaultMediaTracks({ mic: false, webcam: true });
      setWebcamOn(true);
    }
  };

  const _toggleWebcam = () => {
    const videoTrack = videoTrackRef.current;

    if (videoTrack) {
      _handleTurnOffWebcam();
    } else {
      _handleTurnOnWebcam();
    }
  };
  const _handleTurnOffMic = () => {
    const audioTrack = audioTrackRef.current;

    if (audioTrack) {
      audioTrack.stop();

      setAudioTrack(null);
      setMicOn(false);
    }
  };
  const _handleTurnOnMic = () => {
    const audioTrack = audioTrackRef.current;

    if (!audioTrack) {
      getDefaultMediaTracks({ mic: true, webcam: false });
      setMicOn(true);
    }
  };
  const _handleToggleMic = () => {
    const audioTrack = audioTrackRef.current;

    if (audioTrack) {
      _handleTurnOffMic();
    } else {
      _handleTurnOnMic();
    }
  };

  const changeWebcam = async (deviceId) => {
    const currentvideoTrack = videoTrackRef.current;

    if (currentvideoTrack) {
      currentvideoTrack.stop();
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId },
    });
    const videoTracks = stream.getVideoTracks();

    const videoTrack = videoTracks.length ? videoTracks[0] : null;

    setVideoTrack(videoTrack);
  };
  const changeMic = async (deviceId) => {
    const currentAudioTrack = audioTrackRef.current;
    currentAudioTrack && currentAudioTrack.stop();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId },
    });
    const audioTracks = stream.getAudioTracks();

    const audioTrack = audioTracks.length ? audioTracks[0] : null;
    clearInterval(audioAnalyserIntervalRef.current);

    setAudioTrack(audioTrack);
  };

  const getDefaultMediaTracks = async ({ mic, webcam, firstTime }) => {
    if (mic) {
      const audioConstraints = {
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(
        audioConstraints
      );
      const audioTracks = stream.getAudioTracks();

      const audioTrack = audioTracks.length ? audioTracks[0] : null;

      setAudioTrack(audioTrack);
      if (firstTime) {
        setSelectedMic({
          id: audioTrack?.getSettings()?.deviceId,
        });
      }
    }

    if (webcam) {
      const videoConstraints = {
        video: {
          width: 1280,
          height: 720,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(
        videoConstraints
      );
      const videoTracks = stream.getVideoTracks();

      const videoTrack = videoTracks.length ? videoTracks[0] : null;
      setVideoTrack(videoTrack);
      if (firstTime) {
        setSelectedWebcam({
          id: videoTrack?.getSettings()?.deviceId,
        });
      }
    }
  };

  async function startMuteListener() {
    const currentAudioTrack = audioTrackRef.current;

    if (currentAudioTrack) {
      if (currentAudioTrack.muted) {
        setDlgMuted(true);
      }

      currentAudioTrack.addEventListener("mute", (ev) => {
        setDlgMuted(true);
      });
    }
  }

  const getDevices = async ({ micEnabled, webcamEnabled }) => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();

      const webcams = devices.filter((d) => d.kind === "videoinput");
      const mics = devices.filter((d) => d.kind === "audioinput");

      const hasMic = mics.length > 0;
      const hasWebcam = webcams.length > 0;

      setDevices({ webcams, mics, devices });

      if (hasMic) {
        startMuteListener();
      }

      getDefaultMediaTracks({
        mic: hasMic && micEnabled,
        webcam: hasWebcam && webcamEnabled,
        firstTime: true,
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    audioTrackRef.current = audioTrack;

    startMuteListener();

    return () => {
      const currentAudioTrack = audioTrackRef.current;
      currentAudioTrack && currentAudioTrack.stop();
      audioTrackRef.current = null;
    };
  }, [audioTrack]);

  useEffect(() => {
    if (meetingMode === Constants.modes.VIEWER) {
      _handleTurnOffMic();
      _handleTurnOffWebcam();
    }
  }, [meetingMode]);

  useEffect(() => {
    videoTrackRef.current = videoTrack;

    var isPlaying =
      videoPlayerRef.current.currentTime > 0 &&
      !videoPlayerRef.current.paused &&
      !videoPlayerRef.current.ended &&
      videoPlayerRef.current.readyState >
        videoPlayerRef.current.HAVE_CURRENT_DATA;

    if (videoTrack) {
      const videoSrcObject = new MediaStream([videoTrack]);

      if (videoPlayerRef.current) {
        videoPlayerRef.current.srcObject = videoSrcObject;
        if (videoPlayerRef.current.pause && !isPlaying) {
          try {
            videoPlayerRef.current.play();
          } catch (err) {
            console.log("error in playing video", err);
          }
        }
      }

      setTimeout(() => {
        if (popupVideoPlayerRef.current) {
          popupVideoPlayerRef.current.srcObject = videoSrcObject;
          try {
            popupVideoPlayerRef.current.play();
          } catch (err) {
            console.log("error in playing video", err);
          }
        }
      }, 1000);
    } else {
      if (videoPlayerRef.current) {
        videoPlayerRef.current.srcObject = null;
      }
      if (popupVideoPlayerRef.current) {
        popupVideoPlayerRef.current.srcObject = null;
      }
    }
  }, [videoTrack, setting, settingDialogueOpen]);

  useEffect(() => {
    getDevices({ micEnabled, webcamEnabled });
  }, []);

  const ButtonWithTooltip = ({ onClick, onState, OnIcon, OffIcon, mic }) => {
    const [tooltipShow, setTooltipShow] = useState(false);
    const btnRef = useRef();
    const tooltipRef = useRef();

    const openTooltip = () => {
      createPopper(btnRef.current, tooltipRef.current, {
        placement: "top",
      });
      setTooltipShow(true);
    };
    const closeTooltip = () => {
      setTooltipShow(false);
    };

    return (
      <>
        <div>
          <button
            ref={btnRef}
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
            onClick={onClick}
            className={`rounded-full min-w-auto w-11 h-11 flex items-center justify-center ${
              onState ? "bg-white" : "bg-red-600 text-white"
            }`}
            disabled={meetingMode === Constants.modes.VIEWER}
          >
            {onState ? (
              <OnIcon fillcolor={onState ? "#050A0E" : "#fff"} />
            ) : (
              <OffIcon fillcolor={onState ? "#050A0E" : "#fff"} />
            )}
          </button>
        </div>
        <div
          style={{ zIndex: 999 }}
          className={`${
            tooltipShow ? "" : "hidden"
          } overflow-hidden flex flex-col items-center justify-center pb-1.5`}
          ref={tooltipRef}
        >
        </div>
      </>
    );
  };

  return (
    <div className="fixed inset-0">
      <div className="absolute">
        <BackButton />
      </div>
      <div className="flex flex-col flex-1 h-screen overflow-y-auto bg-gray-200">
        <div className="flex flex-1 flex-col md:flex-row items-center justify-center md:m-[72px] m-16">
          <div className="container grid grid-flow-row md:grid-flow-col ">
            <div className="grid grid-cols-12">
              <div className="col-span-12 md:col-span-7 2xl:col-span-6">
                <div className="flex items-center justify-center p-1.5 sm:p-4 lg:p-6">
                  <div className="relative w-full pl-5 pr-5 md:pl-4 sm:pl-10 md:pr-4 sm:pr-10">
                    <div className="relative w-full" style={{ height: "45vh" }}>
                      <video
                        autoPlay
                        playsInline
                        muted
                        ref={videoPlayerRef}
                        controls={false}
                        style={{
                          backgroundColor: "#1c1c1c",
                        }}
                        className={
                          "rounded-[10px] h-full w-full object-cover flex items-center justify-center flip"
                        }
                      />

                      {
                        <>
                          <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center">
                            {!webcamOn ? (
                              <p className="text-xl text-white xl:text-lg 2xl:text-xl">
                                {meetingMode === Constants.modes.VIEWER
                                  ? "카메라와 마이크가 허용되지 않았습니다."
                                  : "카메라가 꺼져있습니다."}
                              </p>
                            ) : null}
                          </div>
                        </>
                      }

                      {settingDialogueOpen ? (
                        <SettingDialogueBox
                          open={settingDialogueOpen}
                          onClose={handleClose}
                          popupVideoPlayerRef={popupVideoPlayerRef}
                          popupAudioPlayerRef={popupAudioPlayerRef}
                          changeWebcam={changeWebcam}
                          changeMic={changeMic}
                          setting={setting}
                          setSetting={setSetting}
                          webcams={webcams}
                          mics={mics}
                          setSelectedMic={setSelectedMic}
                          setSelectedWebcam={setSelectedWebcam}
                          videoTrack={videoTrack}
                          audioTrack={audioTrack}
                        />
                      ) : null}

                      {meetingMode === Constants.modes.CONFERENCE && (
                        <div className="absolute left-0 right-0 xl:bottom-6 bottom-4">
                          <div className="container grid items-center justify-center grid-flow-col space-x-4 md:-m-2">
                            <ButtonWithTooltip
                              onClick={_handleToggleMic}
                              onState={micOn}
                              mic={true}
                              OnIcon={MicOnIcon}
                              OffIcon={MicOffIcon}
                            />
                            <ButtonWithTooltip
                              onClick={_toggleWebcam}
                              onState={webcamOn}
                              mic={false}
                              OnIcon={WebcamOnIcon}
                              OffIcon={WebcamOffIcon}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-start-1 col-end-13">
                {meetingMode === Constants.modes.CONFERENCE && (
                  <div
                    className="bg-gray-700 rounded cursor-pointer md:left-12 lg:left-24 xl:left-44 md:right-12 lg:right-24 xl:right-44"
                    onClick={(e) => {
                      handleClickOpen();
                    }}
                  >
                    <div className="flex flex-row items-center justify-center p-1 m-1">
                      <button className="text-white">
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <p className="ml-1 text-sm text-white">
                        카메라와 마이크를 확인하세요
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-12 md:col-span-5 2xl:col-span-6 md:relative">
                <div className="flex flex-col items-center justify-center flex-1 mt-3 xl:m-16 lg:m-6 md:mt-9 lg:mt-14 xl:mt-20 md:absolute md:left-0 md:right-0 md:top-0 md:bottom-0">
                  <MeetingDetailsScreen
                    participantName={participantName}
                    setParticipantName={setParticipantName}
                    videoTrack={videoTrack}
                    setVideoTrack={setVideoTrack}
                    setMeetingMode={setMeetingMode}
                    meetingMode={meetingMode}
                    onClickStartMeeting={onClickStartMeeting}
                    onClickJoin={async (id) => {
                      const token = await getToken();
                      const valid = await validateMeeting({
                        roomId: id,
                        token,
                      });

                      if (valid) {
                        setToken(token);
                        setMeetingId(id);
                        if (videoTrack) {
                          videoTrack.stop();
                          setVideoTrack(null);
                        }
                        onClickStartMeeting();
                        // setParticipantName("");
                      } else {
                        Swal.fire({
                          title: "올바른 입장 코드를 입력해주세요.",
                          icon: "error",
                          showConfirmButton: true,
                        })
                      }
                    }}
                    _handleOnCreateMeeting={async () => {
                      const token = await getToken();
                      const _meetingId = await createMeeting({ token });
                      setToken(token);
                      setMeetingId(_meetingId);
                      // setParticipantName("");
                      return _meetingId;
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmBox
        open={dlgMuted}
        successText="OKAY"
        onSuccess={() => {
          setDlgMuted(false);
        }}
        title="System mic is muted"
        subTitle="You're default microphone is muted, please unmute it or increase audio
            input volume from system settings."
      />

      <ConfirmBox
        open={dlgDevices}
        successText="DISMISS"
        onSuccess={() => {
          setDlgDevices(false);
        }}
        title="Mic or webcam not available"
        subTitle="Please connect a mic and webcam to speak and share your video in the meeting. You can also join without them."
      />
    </div>
  );
}
