/*
 *  Atos Capital - www.atoscapital.com.br
 *
 *  suporte@atoscapital.com.br
 *
 *
 * Versão 1.0.2 - 06/10/2015
 *  -Criação dos calendários (um pra POS e o outro pra Adquirente).
 *
 * Versão 1.0.1 - 05/10/2015
 *  -Alteração total da tela, tudo que era referente a cadastro pos/terminal virou: lançamento de vendas.
 *
 *  Versão 1.0 - 03/09/2015
 *
 */

// App
angular.module('card-services-lancamento-vendas', [])

.controller("card-services-lancamento-vendasCtrl",
            ['$scope', '$state', '$webapi', '$apis', '$filter',
            function($scope, $state, $webapi, $apis, $filter){

    // flags
    $scope.exibeTela = false;
    $scope.tab = 2;
    // Data
    $scope.datamin = new Date();
    $scope.datamax = null;
    $scope.dataAdquirente = null;
    $scope.dataPos = null;
    $scope.abrirCalendarioDataAdquirente = false;
    $scope.abrirCalendarioDataPos = false;
    $scope.abrirCalendarioDataMin = false;
    $scope.abrirCalendarioDataMax = false;
    // Filtros
    $scope.filiais = [];
    $scope.adquirentes = [];
    $scope.bandeiras = [];
    $scope.filtro = {datamin : new Date(), datamax : '', data : 'Recebimento',
                     filial : null, adquirente : null, terminal: null, bandeira : null,
                     itens_pagina : 0, order : 0,
                     busca : ''
                    };
    // Loader
    var divPortletBody = 0;
    // Objeto do Cupom da Direita
    $scope.cupom = {};
    $scope.exibeCupom = false;
    // Inicialização do controller
    $scope.cardServices_lancamentoVendasInit = function(){
        // Título da página
        $scope.pagina.titulo = 'Card Services';
        $scope.pagina.subtitulo = 'Lançamento de Vendas';
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });
        // Quando o servidor for notificado do acesso a tela, aí sim pode exibí-la
        $scope.$on('acessoDeTelaNotificado', function(event){
            $scope.exibeTela = true;
            // Carregar filiais para 'por POS' e 'por Adquirente'
            console.log('acessou a tela');
            if($scope.usuariologado.grupoempresa) buscaFiliais(true);
        });
        // Acessou a tela
        $scope.$emit("acessouTela");
    };

    // DATA
    var ajustaIntervaloDeData = function(){
      // Verifica se é necessário reajustar a data max para ser no mínimo igual a data min
      if($scope.datamax !== null && $scope.datamax < $scope.datamin) $scope.datamax = $scope.datamin;
      if(!$scope.$$phase) $scope.$apply();
    };
    // Data MIN
    $scope.exibeCalendarioDataMin = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.abrirCalendarioDataMin = !$scope.abrirCalendarioDataMin;
        $scope.abrirCalendarioDataMax = false;
      };
    // Data Por Adquirente
    $scope.exibeCalendarioDataAdquirente = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.abrirCalendarioDataAdquirente = !$scope.abrirCalendarioDataAdquirente;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataAdquirente = function(){
      ajustaIntervaloDeData();
    };
    // Data Por Pos
    $scope.exibeCalendarioDataPos = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.abrirCalendarioDataPos = !$scope.abrirCalendarioDataPos;
        $scope.abrirCalendarioDataMax = false;
      };
    $scope.alterouDataPos = function(){
      ajustaIntervaloDeData();
    };
    // Data MAX
    $scope.exibeCalendarioDataMax = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.abrirCalendarioDataMax = !$scope.abrirCalendarioDataMax;
        $scope.abrirCalendarioDataMin = false;
      };
    $scope.alterouDataMax = function(){
      ajustaIntervaloDeData();
    };
    $scope.limpaDataMax = function () {
        $scope.datamax = null;
      };
    /**
      * Retorna true se a tab informada corresponde a tab em exibição
      */
    $scope.tabIs = function (tab){
        return $scope.tab === tab;
    }
    /**
      * Altera a tab em exibição
      */
    $scope.setTab = function (tab){
        if (tab >= 1 && tab <= 3) $scope.tab = tab;
    }
    /**
      * Busca as filiais
      */
    var buscaFiliais = function(nu_cnpj, idBandeira){

       $scope.showProgress(divPortletBody, 10000);

       var filtros = [];

       // Somente com status ativo
       filtros.push({id: /*$campos.cliente.empresa.fl_ativo*/ 114, valor: 1});

       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){
           filtros.push({id: /*$campos.cliente.empresa.id_grupo*/ 116, valor: $scope.usuariologado.grupoempresa.id_grupo});
           if($scope.usuariologado.empresa) filtros.push({id: /*$campos.cliente.empresa.nu_cnpj*/ 100,
                                                          valor: $scope.usuariologado.empresa.nu_cnpj});
       }

       $webapi.get($apis.getUrl($apis.cliente.empresa,
                                [$scope.token, 0, /*$campos.cliente.empresa.ds_fantasia*/ 104],
                                filtros))
            .then(function(dados){
                console.log(dados);
                $scope.filiais = dados.Registros;
                // Reseta
                if(!nu_cnpj) $scope.filtro.filial = null;
                else $scope.filtro.filial = $filter('filter')($scope.filiais, function(f) {return f.nu_cnpj === nu_cnpj;})[0];
                //$scope.filtro.filial = $scope.filiais.length > 0 ? $scope.filiais[0] : null;
                if($scope.filtro.filial && $scope.filtro.filial !== null) {
                    buscaAdquirentes(true, idBandeira); // Busca adquirentes
                    $scope.hideProgress(divPortletBody);
                } else {
                    $scope.hideProgress(divPortletBody);
                }
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter filiais (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBody);
              });
    };
    /**
      * Selecionou uma filial
      */
    $scope.alterouFilial = function(){
        //console.log($scope.filtro.filial);
        buscaAdquirentes(false);
    };
    /**
      * Busca as adquirentes
      */
    var buscaAdquirentes = function(progressEstaAberto, idOperadora, idBandeira){

       if(!$scope.filtro.filial || $scope.filtro.filial === null){
           $scope.filtro.adquirente = $scope.filtro.bandeira = null;
           return;
       }

       if(!progressEstaAberto) $scope.showProgress(divPortletBody, 10000);

       var filtros = undefined;
       // Filtro do grupo empresa => barra administrativa
       filtros = {id: 305,
                 //id: $campos.pos.operadora.empresa + $campos.cliente.empresa.nu_cnpj - 100,
                  valor: $scope.filtro.filial.nu_cnpj};

       $webapi.get($apis.getUrl($apis.card.tbadquirente,
                                [$scope.token, 0, /*$campos.card.tbadquirente.nmAdquirente*/ 101],
                                filtros))
            .then(function(dados){
                console.log(dados);
                $scope.adquirentes = dados.Registros;
                // Reseta
                if(!idOperadora) $scope.filtro.adquirente = null;
                else $scope.filtro.adquirente = $filter('filter')($scope.adquirentes, function(a) {return a.id === idOperadora;})[0];
                // Busca bandeiras
                if($scope.filtro.adquirente && $scope.filtro.adquirente !== null) buscaBandeiras(true, idBandeira);
                else $scope.hideProgress(divPortletBody);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBody);
              });
    }
    /**
      * Selecionou uma filial
      */
    $scope.alterouAdquirente = function(){
        //console.log($scope.filtro.filial);
        buscaTerminais(false);
    };
    /**
      * Busca as adquirentes
      */
    var buscaTerminais = function(progressEstaAberto, idOperadora, idBandeira){

       if(!$scope.filtro.adquirente || $scope.filtro.adquirente === null){
           $scope.filtro.terminal = null;
           return;
       }

       if(!progressEstaAberto) $scope.showProgress(divPortletBody, 10000);

       var filtros = [];
       // Filtrar por Filial selecionada
       filtros.push({id: 102, valor: $scope.filtro.filial.nu_cnpj});
       // Filtrar por Adquirente selecionada
       filtros.push({id: 101, valor: $scope.filtro.adquirente.cdAdquirente});

       $webapi.get($apis.getUrl($apis.card.tbterminallogico,
                                [$scope.token, 0, /*$campos.card.tbTerminalLogico.cdTerminalLogico*/ 100],
                                filtros))
            .then(function(dados){
                console.log(dados);
                $scope.terminais = dados.Registros;
                // Reseta
                if(!idOperadora) $scope.filtro.terminal = null;
                else $scope.filtro.terminal = $filter('filter')($scope.terminais, function(a) {return a.id === idOperadora;})[0];
                // Busca bandeiras
                //if($scope.filtro.terminal && $scope.filtro.terminal !== null) buscaBandeiras(true, idBandeira);
                //else $scope.hideProgress(divPortletBody);
                $scope.hideProgress(divPortletBody);
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
                 else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBody);
              });
    }

    /**
      * Busca as Bandeiras para a adquirente selecionada
      */
    $scope.buscaBandeiras = function(progressEstaAberto) {
      construirCupom();
      // Se o terminal não tiver setado, bandeira será null
      if(!$scope.filtro.terminal || $scope.filtro.terminal === null){
        $scope.filtro.bandeira = null;
        return;
      }
      if(!progressEstaAberto) $scope.showProgress(divPortletBody, 10000);
      // Definindo filtros
      var filtros = [];
      // Filtrar a partir da adquirente selecionada
      filtros.push({id: 102, valor: $scope.filtro.adquirente.cdAdquirente});
      // Faz a requisição ao banco
      $webapi.get($apis.getUrl($apis.card.tbbandeira,
                               [$scope.token, 0, /*$campos.card.tbTerminalLogico.cdTerminalLogico*/ 101],
                               filtros))
        .then(function(dados){
           console.log(dados);
           $scope.bandeiras = dados.Registros;
           // Reseta
           //if(!idOperadora) $scope.filtro.terminal = null;
           //else $scope.filtro.terminal = $filter('filter')($scope.terminais, function(a) {return a.id === idOperadora;})[0];
           // Busca bandeiras
           //if($scope.filtro.terminal && $scope.filtro.terminal !== null) buscaBandeiras(true, idBandeira);
           //else $scope.hideProgress(divPortletBody);
           $scope.hideProgress(divPortletBody);
         },
         function(failData){
           if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true);
           else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
           else $scope.showAlert('Houve uma falha ao obter adquirentes (' + failData.status + ')', true, 'danger', true);
           $scope.hideProgress(divPortletBody);
         });

    }
    // Alterou Bandeira
    $scope.alterouBandeira = function() {
      $scope.tipo = $scope.filtro.bandeira.dsTipo;
    }
    /**
      * Monta o cupom do lado direito da tela (POS)
      */
    var construirCupom = function() {
      $scope.cupom = {
        adquirente: $scope.filtro.adquirente.nmAdquirente,
        filial: $scope.filtro.filial.ds_fantasia,
        endereco: '',
        cnpj: $scope.filtro.filial.nu_cnpj,
        pos: $scope.filtro.terminal.cdTerminalLogico,
        data: $scope.dataPos,
        bandeiras: []
      }
      console.log($scope.cupom);
      $scope.exibeCupom = true;
    }

}]);
