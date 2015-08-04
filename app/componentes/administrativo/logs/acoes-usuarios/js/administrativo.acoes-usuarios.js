/*
 *  Atos Capital - www.atoscapital.com.br
 *  
 *  suporte@atoscapital.com.br
 *
 */

// App
angular.module("administrativo-acoes-usuarios", []) 

.controller("administrativo-acoes-usuariosCtrl", ['$scope',
                                            '$state',
                                            '$http',
                                            '$campos',
                                            '$webapi',
                                            '$apis',
                                            '$filter', 
                                            function($scope,$state,$http,$campos,
                                                     $webapi,$apis,$filter){ 
   
    var divPortletBodyLogsPos = 0; // posição da div que vai receber o loading progress
    $scope.paginaInformada = 1; // página digitada pelo privilégio
    $scope.logs = [];
    $scope.camposBusca = [{
                            id: $campos.administracao.tblogacessousuario.webpagesusers + 
                                $campos.administracao.webpagesusers.ds_login - 100,
                            ativo: true,  
                            nome: "Login"
                          },
                          {
                            id: $campos.administracao.tblogacessousuario.dsUrl,
                            ativo: true,  
                            nome: "URL"
                          }];
    $scope.itens_pagina = [10, 20, 50, 100];
    $scope.filtro = {busca:'', campo_busca : $scope.camposBusca[0], 
                      itens_pagina : $scope.itens_pagina[0], pagina : 1,
                      total_registros : 0, faixa_registros : '0-0', total_paginas : 0, 
                      campo_ordenacao : {id: $campos.administracao.tblogacessousuario.dtAcessos, order : 1}};    
    
 
                                                
    // Inicialização do controller
    $scope.administrativoAcoesUsuariosInit = function(){
        // Título da página 
        $scope.pagina.titulo = 'Logs';                          
        $scope.pagina.subtitulo = 'Ações de Usuários';
        // Busca Logs
        $scope.buscaLogs();
        // Quando houver uma mudança de rota => modificar estado
        $scope.$on('mudancaDeRota', function(event, state, params){
            $state.go(state, params);
        });  
    }; 
                                                
                                                
    // ORDENAÇÃO
    /**
      * Modifica a ordenação
      */
    var ordena = function(posCampo){
        if(posCampo >= 0 && posCampo < $scope.camposBusca.length){
            if($scope.filtro.campo_ordenacao.id !== $scope.camposBusca[posCampo].id){ 
                $scope.filtro.campo_ordenacao.id = $scope.camposBusca[posCampo].id;
                $scope.filtro.campo_ordenacao.order = 0; // começa descendente                                 
            }else
                // Inverte a ordenação: ASCENDENTE => DESCENDENTE e vice-versa                                
                $scope.filtro.campo_ordenacao.order = $scope.filtro.campo_ordenacao.order === 0 ? 1 : 0;                                
            $scope.buscaLogs(); 
        }
    };
    /**
      * Ordena por nome
      */
    $scope.ordena = function(){
        ordena(0);    
    }
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma crescente
      */
    $scope.estaOrdenadoCrescente = function(){
        return $scope.filtro.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.filtro.campo_ordenacao.order === 0;    
    };
    /**
      * Retorna true se a ordenação está sendo feito por nome de forma decrescente
      */
    $scope.estaOrdenadoDecrescente = function(){
        return $scope.filtro.campo_ordenacao.id === $scope.camposBusca[0].id && 
               $scope.filtro.campo_ordenacao.order === 1;    
    };                          
                                            
                                            
                                                
    // PAGINAÇÃO
    /**
      * Altera efetivamente a página exibida
      */                                            
    var setPagina = function(pagina){
       if(pagina >= 1 && pagina <= $scope.filtro.total_paginas){ 
           $scope.filtro.pagina = pagina;
           $scope.buscaLogs(); 
       }
       $scope.atualizaPaginaDigitada();    
    };
    /**
      * Vai para a página anterior
      */
    $scope.retrocedePagina = function(){
        setPagina($scope.filtro.pagina - 1); 
    };
    /**
      * Vai para a página seguinte
      */                                            
    $scope.avancaPagina = function(){
        setPagina($scope.filtro.pagina + 1); 
    };
    /**
      * Foi informada pelo usuário uma página para ser exibida
      */                                            
    $scope.alteraPagina = function(){
        if($scope.paginaInformada) setPagina(parseInt($scope.paginaInformada));
        else $scope.setaPaginaDigitada();  
    };
    /**
      * Sincroniza a página digitada com a que efetivamente está sendo exibida
      */                                            
    $scope.atualizaPaginaDigitada = function(){
        $scope.paginaInformada = $scope.filtro.pagina; 
    };                                             
    /**
      * Notifica que o total de itens por página foi alterado
      */                                            
    $scope.alterouItensPagina = function(){
        $scope.buscaLogs();   
    };
     
    // BUSCA
    $scope.filtraLogs = function(filtro){
        $scope.filtro.busca = filtro;
        $scope.buscaLogs();
    };
    $scope.buscaLogs = function(){
       $scope.showProgress(divPortletBodyLogsPos);    
        
       var filtros = undefined;
       
       // Só considera busca de filtro a partir de três caracteres    
       if($scope.filtro.busca.length > 0) filtros = {id: $scope.filtro.campo_busca.id, valor: $scope.filtro.busca + '%'};        
       // Filtro do grupo empresa => barra administrativa
       if($scope.usuariologado.grupoempresa){
            var filtroGrupoEmpresa = {id: $campos.administracao.tblogacessousuario.webpagesusers + 
                                          $campos.administracao.webpagesusers.id_grupo - 100, 
                                      valor: $scope.usuariologado.grupoempresa.id_grupo};
            if(filtros) filtros = [filtros, filtroGrupoEmpresa];
            else filtros = filtroGrupoEmpresa;
       }
        
       $webapi.get($apis.getUrl($apis.administracao.tblogacessousuario, 
                                [$scope.token, 2, $scope.filtro.campo_ordenacao.id, 
                                 $scope.filtro.campo_ordenacao.order, 
                                 $scope.filtro.itens_pagina, $scope.filtro.pagina],
                   filtros)) 
            .then(function(dados){
                $scope.logs = dados.Registros;
                $scope.filtro.total_registros = dados.TotalDeRegistros;
                $scope.filtro.total_paginas = Math.ceil($scope.filtro.total_registros / $scope.filtro.itens_pagina);
                if($scope.logs.length === 0) $scope.filtro.faixa_registros = '0-0';
                else{
                    var registroInicial = ($scope.filtro.pagina - 1)*$scope.filtro.itens_pagina + 1;
                    var registroFinal = registroInicial - 1 + $scope.filtro.itens_pagina;
                    if(registroFinal > $scope.filtro.total_registros) registroFinal = $scope.filtro.total_registros;
                    $scope.filtro.faixa_registros =  registroInicial + '-' + registroFinal;
                }
                $scope.hideProgress(divPortletBodyLogsPos);
                // Verifica se a página atual é maior que o total de páginas
                if($scope.filtro.pagina > $scope.filtro.total_paginas)
                    setPagina(1); // volta para a primeira página e refaz a busca
              },
              function(failData){
                 if(failData.status === 0) $scope.showAlert('Falha de comunicação com o servidor', true, 'warning', true); 
                 //else if(failData.status === 503 || failData.status === 404) $scope.voltarTelaLogin(); // Volta para a tela de login
                 else $scope.showAlert('Houve uma falha ao requisitar logs (' + failData.status + ')', true, 'danger', true);
                 $scope.hideProgress(divPortletBodyLogsPos);
              }); 
    };
        
                                                                                       
                                                
    // AÇÕES
    $scope.logSucesso = function(log){
        if(!log) return false;
        return log.codResposta === 200;
    }
    /**
      * Exibe as funcionalidades associadas ao privilégio
      */
    $scope.detalhaLog = function(log){
        // Reseta permissões
        $scope.log = log;
        // Exibe o modal
        $('#modalLog').modal('show');
        
    }; 

}])