export interface MessageInputMap {
    'schedule:import': { slug: string }
    'schedule:setInterstitialCompleted': { scheduleItemId: string, completed: boolean }

    'speedrun:seekToNextRun': never
    'speedrun:seekToPreviousRun': never
    'speedrun:setActiveSpeedrun': { scheduleItemId: string }
}

type MessagesWithoutReturnValues = Exclude<keyof MessageInputMap, keyof InnerMessageResultMap>;

interface InnerMessageResultMap {

}

export type MessageResultMap = InnerMessageResultMap & {
    [Key in MessagesWithoutReturnValues]: void
}
