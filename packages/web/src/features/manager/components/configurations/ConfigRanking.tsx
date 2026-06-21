import { EVENTS } from "@razzia/common/constants"
import type { RankingPlayer, RankingStats } from "@razzia/common/types/game"
import {
    useEvent,
    useSocket,
} from "@razzia/web/features/game/contexts/socket-context"
import { ChevronDown, Medal, Trophy } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

const rankColor = (index: number) => {
  if (index === 0) {
    return "text-amber-500"
  }

  if (index === 1) {
    return "text-gray-400"
  }

  if (index === 2) {
    return "text-amber-700"
  }

  return "text-gray-300"
}

interface RankingTableProps {
  players: RankingPlayer[]
  pointsLabel: string
  gamesLabel: string
}

const RankingTable = ({
  players,
  pointsLabel,
  gamesLabel,
}: RankingTableProps) => (
  <div className="space-y-1.5">
    {players.map((player, index) => (
      <div
        key={`${player.username}-${player.playerId}`}
        className="flex items-center gap-3 rounded-md px-3 py-2 outline outline-gray-300"
      >
        <span className="w-6 shrink-0 text-center font-semibold text-gray-500">
          {index < 3 ? (
            <Medal className={`mx-auto size-4 ${rankColor(index)}`} />
          ) : (
            index + 1
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{player.username}</p>
          <p className="text-xs text-gray-400">
            {gamesLabel}: {player.gamesPlayed}
          </p>
        </div>
        <span className="shrink-0 font-semibold">
          {player.totalPoints} {pointsLabel}
        </span>
      </div>
    ))}
  </div>
)

const ConfigRanking = () => {
  const { socket } = useSocket()
  const { t } = useTranslation()
  const [stats, setStats] = useState<RankingStats | null>(null)
  const [openQuiz, setOpenQuiz] = useState<string | null>(null)

  useEvent(
    EVENTS.RESULTS.STATS,
    useCallback((data) => setStats(data), []),
  )

  useEffect(() => {
    socket.emit(EVENTS.RESULTS.GET_STATS)
  }, [socket])

  const pointsLabel = t("manager:ranking.points")
  const gamesLabel = t("manager:ranking.games")

  if (!stats || stats.totalGames === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <p className="my-8 text-center text-gray-500">
          {t("manager:ranking.none")}
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 grid shrink-0 grid-cols-3 gap-2">
        <div className="rounded-md bg-gray-100 px-2 py-2 text-center">
          <p className="text-lg font-semibold">{stats.totalGames}</p>
          <p className="text-xs text-gray-500">{t("manager:ranking.gamesPlayed")}</p>
        </div>
        <div className="rounded-md bg-gray-100 px-2 py-2 text-center">
          <p className="text-lg font-semibold">{stats.global.length}</p>
          <p className="text-xs text-gray-500">{t("manager:ranking.players")}</p>
        </div>
        <div className="rounded-md bg-gray-100 px-2 py-2 text-center">
          <p className="text-lg font-semibold">{stats.byQuiz.length}</p>
          <p className="text-xs text-gray-500">{t("manager:ranking.quizzes")}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-0.5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Trophy className="size-4 text-amber-500" />
            <p className="font-semibold">{t("manager:ranking.global")}</p>
          </div>
          <RankingTable
            players={stats.global}
            pointsLabel={pointsLabel}
            gamesLabel={gamesLabel}
          />
        </div>

        <div>
          <p className="mb-2 font-semibold">{t("manager:ranking.byQuiz")}</p>
          <div className="space-y-2">
            {stats.byQuiz.map((quiz) => {
              const isOpen = openQuiz === quiz.subject

              return (
                <div
                  key={quiz.subject}
                  className="rounded-md outline outline-gray-300"
                >
                  <button
                    className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
                    onClick={() =>
                      setOpenQuiz(isOpen ? null : quiz.subject)
                    }
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{quiz.subject}</p>
                      <p className="text-xs text-gray-400">
                        {t("manager:ranking.gamesCount", {
                          count: quiz.gamesPlayed,
                        })}{" "}
                        ·{" "}
                        {t("manager:ranking.playerCount", {
                          count: quiz.playerCount,
                        })}
                      </p>
                    </div>
                    <ChevronDown
                      className={`size-4 shrink-0 text-gray-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-gray-200 p-2">
                      <RankingTable
                        players={quiz.players}
                        pointsLabel={pointsLabel}
                        gamesLabel={gamesLabel}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigRanking
