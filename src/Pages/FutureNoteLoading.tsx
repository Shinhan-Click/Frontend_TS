import React, { useMemo, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { ApiResponse } from '../types/api';

// 프록시 사용: 모든 API는 /api 로 호출
const API_BASE = '/api';

const FutureNoteLoading: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [progress, setProgress] = useState<number>(0);
    const [apiCompleted, setApiCompleted] = useState<boolean>(false);
    const [isCallInProgress, setIsCallInProgress] = useState<boolean>(false);

    const size = 22;
    const stroke = 4;
    const r = (size - stroke) / 2;
    const circumference = 2 * Math.PI * r;
    const dash = useMemo(() => circumference * (progress / 100), [circumference, progress]);

    useEffect(() => {
        let isMounted = true;
        let progressInterval: NodeJS.Timeout;
        
        // API 호출 함수
        const callApi = async () => {
            // 이미 호출 중이거나 완료된 경우 리턴
            if (isCallInProgress || apiCompleted) {
                console.log('API 호출 스킵: 이미 진행 중이거나 완료됨');
                return;
            }
            
            try {
                setIsCallInProgress(true); // 호출 진행 중 플래그 설정
                console.log('API 호출 시작');
                
                const apiRequestBody = location.state?.apiRequestBody;
                const formData = location.state?.formData;

                if (!apiRequestBody) {
                    console.error('No API request body found');
                    navigate('/FutureNoteWrite');
                    return;
                }

                // API 호출 - Home.tsx 패턴 따라함
                const response = await fetch(`${API_BASE}/futurenote/generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(apiRequestBody),
                    credentials: 'include' // 쿠키 포함
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data: ApiResponse<any> = await response.json();
                
                console.log('API 응답 완료:', data);

                if (!data.isSuccess) {
                    throw new Error(data.message || 'API 호출 실패');
                }

                const apiResult = data.result;
                console.log('API 결과:', apiResult);

                if (isMounted) {
                    setApiCompleted(true); // 성공 시에만 완료 플래그 설정
                    
                    // API 응답과 폼 데이터를 함께 저장
                    const completeState = {
                        ...formData,
                        apiResult,
                        completedAt: Date.now()
                    };
                    
                    localStorage.setItem('futureNoteState', JSON.stringify(completeState));
                    
                    navigate('/FutureNote', { 
                        state: { 
                            formData: completeState,
                            apiResult 
                        }
                    });
                }

            } catch (error) {
                console.error('API call failed:', error);
                if (isMounted) {
                    setIsCallInProgress(false); // 실패시 진행 중 플래그만 해제
                    alert('퓨처노트 생성에 실패했습니다. 다시 시도해주세요.');
                    navigate('/FutureNote');
                }
            }
        };

        // 진행률 애니메이션 시작
        progressInterval = setInterval(() => {
            setProgress(prev => {
                if (apiCompleted) {
                    return 100; // API 완료되면 100%로
                } else if (prev < 95) {
                    return prev + Math.random() * 2; // 95%까지 점진적 증가
                } else {
                    return prev; // 95%에서 대기
                }
            });
        }, 150);

        // API 호출 시작
        callApi();

        return () => {
            isMounted = false;
            setIsCallInProgress(false); // cleanup에서 플래그 해제
            if (progressInterval) {
                clearInterval(progressInterval);
            }
        };
    }, [navigate, location.state]); // state 변수들 제거!

    const handleCancel = () => {
        // 생성 중단
        localStorage.removeItem('futureNoteState');
        navigate('/FutureNoteWrite');
    };

    return (
        <div className="min-h-screen bg-[#FFF] flex items-center justify-center">
            <div className="w-[375px] h-[896px] bg-[#141924] text-gray-200 flex flex-col overflow-hidden">
                <header className="relative flex-shrink-0 h-[50px] flex items-center justify-start px-4 mt-[10px]">
                    <button
                        type="button"
                        aria-label="닫기"
                        onClick={() => navigate('/FutureNoteWrite')}
                        className="ml-[18px] text-[#FFF] hover:text-white bg-transparent border-none"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M6 6l12 12M18 6L6 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </header>

                <main className="flex-1 px-6 text-center flex flex-col items-center justify-start mt-[40px]">
                    <h2 className="text-[20px] font-bold text-[#FFF]">퓨처노트 생성 중…</h2>
                    <p className="mt-3 text-[13px] leading-[18px] text-[#F8F8FA]">
                        이 페이지에서 나갈 수 있습니다.
                        <br />
                        준비되면 알림을 통해 확인할 수 있습니다.
                    </p>

                    <div className="mt-6 flex items-center justify-center gap-[6px]">
                        <div className="relative" aria-label={`진행률 ${Math.round(progress)}%`}>
                            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                                <circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={r}
                                    stroke="#1F2A44"
                                    strokeWidth={stroke}
                                    fill="none"
                                />
                                <circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={r}
                                    stroke="#B093F9"
                                    strokeWidth={stroke}
                                    strokeLinecap="round"
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference - dash}
                                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                                />
                            </svg>
                        </div>
                        <div className="text-left">
                            <div className="text-[14px] text-[#B093F9]">{Math.round(progress)}% 완료</div>
                        </div>
                    </div>

                    <div className="mt-[30px] flex items-center justify-center">
                        <img
                            src="/loading.png"
                            alt="로딩중"
                            className="w-[300px] h-[340px] object-contain"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleCancel}
                        className="mt-[100px] text-[16px] text-[#FFF] font-[400] underline underline-offset-4 decoration-white/60 bg-transparent border-none"
                    >
                        생성 중단
                    </button>
                </main>
            </div>
        </div>
    );
};

export default FutureNoteLoading;