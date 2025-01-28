import type { Meta, StoryObj } from "@storybook/react";
import { CardsQueryStatusMock } from "~/common/hooks/graphql/Cards.query.mock";
import { mockCustomerProviderSupplier } from "~/common/testUtils/mockCustomerProvider";
import { ConnectionsWithAllAccountingProvidersConnectedQueryMock } from "~/features/connections/graphql/Connections.query.mock";
import {
  NoPotsQueryMock,
  PotsQueryMock,
} from "~/features/pots/graphql/pots.query.mock";
import { ProfileInfoQueryMock } from "~/features/profile/graphql/ProfileInfo.query.mock";
import { GetReferralCodeQueryMock } from "~/features/referrals/GetReferralCode/graphql/GetReferralCode.query.mock";
import { BannerType, CardStatus } from "~/graphql/types";
import { AppStoryComponent, defaultParameters } from "../AppStoryComponent";
import { withBannerMock } from "../decorators/withBannerMock";
import { withMockFeatures } from "../decorators/withMockFeatures";
import { withMockShare } from "../decorators/withMockShare";
import { withMockTrackingConsentProvider } from "../decorators/withMockTrackingConsentProvider";
import { withNavigateOnAppStart } from "../decorators/withNavigateOnAppStart";
import { withActiveUser } from "../decorators/withUser";
import { Payment3DsRequestTakeoverQueryMock } from "../graphql/Payment3DsRequestTakeover.query.mock";
import { FinCrimeFrozenQueryMock } from "~/features/cash-deposits/graphql/FinCrimeFrozen.query.mock";
import { withStorybookApolloProvider } from "../withRootDecorator/withStorybookApolloProvider";
import { withApolloMocks } from "~/withRootDecorator/withApolloMocks";

const meta = {
  component: AppStoryComponent,
  beforeEach: [something],
  decorators: [
    withMockTrackingConsentProvider({ status: "complete" }),
    withActiveUser(),
    withStorybookApolloProvider({
      mocks: [Payment3DsRequestTakeoverQueryMock()],
    }),
    withMockShare(),
  ],
  parameters: defaultParameters,
} satisfies Meta;
export default meta;

type Story = StoryObj<typeof meta>;

export const ActivateYourPendingCard = {
  decorators: [withUser(), decoratorReference, withFeaturesProvider()],
} satisfies Story;

export const GenieAllEnabled = {
  decorators: [
    withStorybookApolloProvider({
      mocks: [FinCrimeFrozenQueryMock()],
    }),
  ],
} satisfies Story;

export const GenieAllEnabledWithCustomerContext = {
  decorators: [
    withStorybookApolloProvider({
      mocks: [FinCrimeFrozenQueryMock()],
      customerContext: mockCustomerProviderSupplier("GENIE"),
    }),
  ],
} satisfies Story;

export const GenieAllEnabledWithJustCustomerContext = {
  decorators: [
    withStorybookApolloProvider({
      customerContext: mockCustomerProviderSupplier("GENIE"),
    }),
  ],
} satisfies Story;

export const WithPotsAndInterestPot = {
  decorators: [
    withApolloMocks({
      operationMocks: [
        TransfersInAndInterestPotTransactionsQueryMock(),
        PotsQueryMockWithInterestPot(),
        PotInterestRatesQueryMock(),
      ],
    }),
    withActiveUser({
      supplier: "GENIE",
    }),
    withStorybookApolloProvider({
      customerContext: mockCustomerProviderSupplier("GENIE"),
    }),
  ],
  args: { storage_hasSeenPotIntroCarousel: "1" },
} satisfies Story;
