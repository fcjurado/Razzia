import { EVENTS } from "@razzia/common/constants"
import type { SocketContext } from "@razzia/socket/handlers/types"
import {
    deleteResult,
    getRankingStats,
    getResultById,
} from "@razzia/socket/services/config"
import manager, { emitConfig } from "@razzia/socket/services/manager"

export const resultsSocketHandlers = ({ socket }: SocketContext) => {
  socket.on(
    EVENTS.RESULTS.GET,
    manager.withAuth(socket, (id) => {
      try {
        socket.emit(EVENTS.RESULTS.DATA, getResultById(id))
      } catch (error) {
        console.error("Failed to get result:", error)
      }
    }),
  )

  socket.on(
    EVENTS.RESULTS.DELETE,
    manager.withAuth(socket, (id) => {
      try {
        deleteResult(id)
        emitConfig(socket)
      } catch (error) {
        console.error("Failed to delete result:", error)
      }
    }),
  )

  socket.on(
    EVENTS.RESULTS.GET_STATS,
    manager.withAuth(socket, () => {
      try {
        socket.emit(EVENTS.RESULTS.STATS, getRankingStats())
      } catch (error) {
        console.error("Failed to get ranking stats:", error)
      }
    }),
  )
}
